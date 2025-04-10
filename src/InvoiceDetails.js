import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, set } from "firebase/database";
import { realtimeDb } from "./firebase";
import { useTranslation } from "react-i18next";

function InvoiceDetails({
  user,
  invoices,
  setInvoices,
  inventory,
  setInventory,
}) {
  const { t } = useTranslation();
  const { id } = useParams();
  const invoice = invoices.find((inv) => inv.id === parseInt(id));
  const [isEditing, setIsEditing] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: "",
    qty: "",
    bonusQty: "",
  });
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceImageUrl, setInvoiceImageUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Initialize state when entering edit mode
  useEffect(() => {
    if (invoice && isEditing && !customerName) {
      setCustomerName(invoice.customerName);
      setSelectedItems(invoice.items.map((item) => ({ ...item })));
      setInvoiceDate(new Date(invoice.date).toISOString().split("T")[0]);
      setInvoiceNumber(invoice.invoiceNumber || "");
      setInvoiceImageUrl(invoice.invoiceImageUrl || "");
      setNotes(invoice.notes || "");
    }
  }, [invoice, isEditing]);

  if (!invoice) {
    return (
      <div className="text-center text-gray-900 dark:text-slate-50">
        {t("Invoice not found!")}
      </div>
    );
  }

  const handleAddItem = () => {
    if (currentItem.itemId && currentItem.qty) {
      const itemId = parseInt(currentItem.itemId, 10);
      const item = inventory?.find((i) => i.id === itemId);
      const requestedQty =
        parseInt(currentItem.qty) + (parseInt(currentItem.bonusQty) || 0);

      if (!item) {
        alert(t("Item not found in inventory"));
        return;
      }
      if (item.qty < requestedQty) {
        alert(t("Not enough stock", { available: item.qty }));
        return;
      }

      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          orderedQty: parseInt(currentItem.qty),
          bonusQty: parseInt(currentItem.bonusQty) || 0,
        },
      ]);
      setCurrentItem({ itemId: "", qty: "", bonusQty: "" });
    } else {
      alert(t("Please select an item and specify a quantity"));
    }
  };

  const handleEditItemQty = (index, field, value) => {
    const updatedItems = [...selectedItems];
    const newValue = parseInt(value) || 0;
    updatedItems[index] = { ...updatedItems[index], [field]: newValue };
    setSelectedItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
  };

  const handleSave = async () => {
    if (!customerName || selectedItems.length === 0 || !invoiceDate) {
      alert(t("Please provide a customer name, items, and invoice date"));
      return;
    }
    if (!inventory) {
      alert(t("Inventory data is not available. Please try again later."));
      return;
    }

    // Restore original inventory quantities
    const restoredInventory = inventory.map((item) => {
      const originalItem = invoice.items.find((si) => si.id === item.id);
      return originalItem
        ? {
            ...item,
            qty: item.qty + (originalItem.orderedQty + originalItem.bonusQty),
          }
        : item;
    });

    // Deduct new quantities from inventory
    const updatedInventory = restoredInventory.map((item) => {
      const orderedItem = selectedItems.find((si) => si.id === item.id);
      return orderedItem
        ? {
            ...item,
            qty: item.qty - (orderedItem.orderedQty + orderedItem.bonusQty),
          }
        : item;
    });

    // Check if any inventory item has negative stock
    const hasNegativeStock = updatedInventory.some((item) => item.qty < 0);
    if (hasNegativeStock) {
      alert(t("Cannot save: Insufficient stock for some items"));
      return;
    }

    const updatedInvoice = {
      ...invoice,
      customerName,
      date: new Date(invoiceDate).toISOString(),
      items: selectedItems,
      total: selectedItems.reduce(
        (acc, item) => acc + item.orderedQty * item.price,
        0
      ),
      invoiceNumber,
      invoiceImageUrl,
      notes,
    };

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoice.id ? updatedInvoice : inv
    );

    // Update local state
    setInvoices(updatedInvoices);
    setInventory(updatedInventory);

    // Sync to Firebase
    const invoicesRef = ref(realtimeDb, `users/${user.uid}/invoices`);
    const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
    try {
      await Promise.all([
        set(invoicesRef, updatedInvoices),
        set(inventoryRef, updatedInventory),
      ]);
      alert(t("Invoice saved successfully"));
      setIsEditing(false);
    } catch (error) {
      console.error("Error syncing data:", error);
      alert(t("Failed to save invoice to database"));
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t("Are you sure you want to delete this invoice?"))) {
      if (!inventory) {
        alert(t("Inventory data is not available. Please try again later."));
        return;
      }

      const updatedInventory = inventory.map((item) => {
        const invoiceItem = invoice.items.find((si) => si.id === item.id);
        return invoiceItem
          ? {
              ...item,
              qty: item.qty + (invoiceItem.orderedQty + invoiceItem.bonusQty),
            }
          : item;
      });

      const updatedInvoices = invoices.filter((inv) => inv.id !== invoice.id);
      setInvoices(updatedInvoices);
      setInventory(updatedInventory);

      const invoicesRef = ref(realtimeDb, `users/${user.uid}/invoices`);
      const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
      await Promise.all([
        set(invoicesRef, updatedInvoices),
        set(inventoryRef, updatedInventory),
      ]).catch((error) => console.error("Error syncing data:", error));
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        {t("Invoice Details")}
      </h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md w-full">
        {isEditing ? (
          <>
            <input
              type="text"
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              placeholder={t("Customer Name")}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="text"
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              placeholder={t("Invoice Number")}
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
            <input
              type="date"
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            <input
              type="text"
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              placeholder={t("Invoice Image URL (Optional)")}
              value={invoiceImageUrl}
              onChange={(e) => setInvoiceImageUrl(e.target.value)}
            />
            {invoiceImageUrl && (
              <div className="mb-4">
                <p>{t("Invoice Image Preview")}</p>
                <img
                  src={invoiceImageUrl}
                  alt="Invoice Preview"
                  className="w-32 h-32 object-cover"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/128")
                  }
                />
              </div>
            )}
            <textarea
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              placeholder={t("Notes")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-col gap-4">
              <select
                className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
                value={currentItem.itemId}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, itemId: e.target.value })
                }
              >
                <option value="">{t("Select Item")}</option>
                {inventory ? (
                  inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.qty} {t("in stock")}
                    </option>
                  ))
                ) : (
                  <option value="">{t("Loading inventory...")}</option>
                )}
              </select>
              <input
                type="number"
                className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
                placeholder={t("Quantity")}
                value={currentItem.qty}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, qty: e.target.value })
                }
              />
              <input
                type="number"
                className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
                placeholder={t("Bonus Quantity (Optional)")}
                value={currentItem.bonusQty}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, bonusQty: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full mb-4"
            >
              {t("Add Item")}
            </button>
            <div className="mt-6">
              <h3 className="font-semibold">{t("Items")}</h3>
              <ul className="list-disc pl-6">
                {selectedItems.map((item, index) => (
                  <li key={index} className="mb-4 flex items-center">
                    {item.name} -{" "}
                    <input
                      type="number"
                      className="p-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-20 inline mx-2"
                      value={item.orderedQty}
                      onChange={(e) =>
                        handleEditItemQty(index, "orderedQty", e.target.value)
                      }
                    />{" "}
                    x {item.price.toFixed(2)} IQD (Bonus:{" "}
                    <input
                      type="number"
                      className="p-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-20 inline mx-2"
                      value={item.bonusQty}
                      onChange={(e) =>
                        handleEditItemQty(index, "bonusQty", e.target.value)
                      }
                    />
                    )
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="ml-4 bg-red-500 text-white px-2 py-1 rounded-md"
                    >
                      {t("Remove")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold mb-4">
              Customer: {invoice.customerName}
            </h3>
            <p className="mb-4">
              Invoice Number: {invoice.invoiceNumber || "N/A"}
            </p>
            <p className="mb-4">
              Date: {new Date(invoice.date).toLocaleDateString()}
            </p>
            {invoice.invoiceImageUrl && (
              <div className="mb-4">
                <p>{t("Invoice Image")}</p>
                <img
                  src={invoice.invoiceImageUrl}
                  alt="Invoice"
                  className="w-32 h-32 object-cover"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/128")
                  }
                />
              </div>
            )}
            <p className="mb-4">Notes: {invoice.notes || "N/A"}</p>
            <h4 className="font-semibold">Items:</h4>
            <ul className="list-disc pl-6">
              {invoice.items.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.orderedQty} x {item.price.toFixed(2)} IQD
                  (Bonus: {item.bonusQty})
                </li>
              ))}
            </ul>
            <div className="mt-4 font-semibold">
              <p>Total Value: {invoice.total.toFixed(2)} IQD</p>
            </div>
          </>
        )}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-md text-white ${
              isEditing ? "bg-gray-500" : "bg-yellow-500"
            }`}
          >
            {isEditing ? t("Cancel") : t("Edit")}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              {t("Save")}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            {t("Delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;
