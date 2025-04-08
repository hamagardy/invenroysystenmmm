import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { realtimeDb } from "./firebase";
import { useTranslation } from "react-i18next";

function CreateInvoice({ inventory, setInventory, invoices, setInvoices }) {
  const { t } = useTranslation();
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: "",
    qty: "",
    bonusQty: "",
  });
  const [invoiceDate, setInvoiceDate] = useState("");

  // Fetch invoices from Firebase
  useEffect(() => {
    const invoicesRef = ref(realtimeDb, "invoices");
    onValue(
      invoicesRef,
      (snapshot) => {
        const data = snapshot.val();
        setInvoices(data || []);
      },
      (error) => {
        console.error("Error fetching invoices:", error);
      }
    );
  }, [setInvoices]);

  const handleAddItem = () => {
    if (currentItem.itemId && currentItem.qty) {
      const itemId = parseInt(currentItem.itemId, 10);
      const item = inventory.find((i) => i.id === itemId);
      const requestedQty =
        parseInt(currentItem.qty) + (parseInt(currentItem.bonusQty) || 0);

      if (!item || item.qty < requestedQty) {
        alert(t("Not enough stock", { available: item?.qty || 0 }));
        return;
      }

      setSelectedItems([
        ...selectedItems,
        {
          ...item,
          orderedQty: parseInt(currentItem.qty),
          bonusQty: parseInt(currentItem.bonusQty) || 0,
        },
      ]);
      setCurrentItem({ itemId: "", qty: "", bonusQty: "" });
    }
  };

  const handleSaveInvoice = async () => {
    if (customerName && selectedItems.length > 0 && invoiceDate) {
      const newInvoice = {
        id: Date.now(), // Use timestamp for unique ID
        customerName,
        date: new Date(invoiceDate).toISOString(),
        items: selectedItems,
        total: selectedItems.reduce(
          (acc, item) => acc + item.orderedQty * item.price,
          0
        ),
        type: "sale",
      };

      const updatedInventory = inventory.map((item) => {
        const orderedItem = selectedItems.find((si) => si.id === item.id);
        if (orderedItem) {
          return {
            ...item,
            qty: item.qty - (orderedItem.orderedQty + orderedItem.bonusQty),
          };
        }
        return item;
      });

      // Update state
      setInvoices([...invoices, newInvoice]);
      setInventory(updatedInventory);

      // Sync to Firebase
      const invoicesRef = ref(realtimeDb, "invoices");
      const inventoryRef = ref(realtimeDb, "inventory");
      await Promise.all([
        set(invoicesRef, [...invoices, newInvoice]),
        set(inventoryRef, updatedInventory),
      ]).catch((error) => console.error("Error syncing data:", error));

      // Reset form
      setCustomerName("");
      setSelectedItems([]);
      setInvoiceDate("");
    } else {
      alert(t("Please provide a customer name, items, and invoice date"));
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        {t("Create Invoice")}
      </h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md w-full">
        <input
          type="text"
          className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
          placeholder={t("Customer Name")}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          type="date"
          className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
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
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.qty} {t("in stock")}
              </option>
            ))}
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
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
        >
          {t("Add Item")}
        </button>
        <div className="mt-6">
          <h3 className="font-semibold">{t("Items")}</h3>
          <ul className="list-disc pl-6">
            {selectedItems.map((item, index) => (
              <li key={index}>
                {item.name} - {item.orderedQty} x ${item.price} (Bonus:{" "}
                {item.bonusQty})
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={handleSaveInvoice}
            className="bg-green-500 text-white px-4 py-2 rounded-md w-full sm:w-auto"
          >
            {t("Save Invoice")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateInvoice;
