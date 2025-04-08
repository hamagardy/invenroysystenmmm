import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, set } from "firebase/database";
import { realtimeDb } from "./firebase";
import { useTranslation } from "react-i18next";

function ReturnDetails({
  returnHistory,
  setReturnHistory,
  inventory,
  setInventory,
  user,
}) {
  const { t } = useTranslation();
  const { id } = useParams();
  const returnRecord = returnHistory.find(
    (record) => record.id === parseInt(id)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: "",
    returnedQty: "",
    bonusQty: "",
  });
  const [returnDate, setReturnDate] = useState("");
  const [returnImageUrl, setReturnImageUrl] = useState(""); // Added return-level image

  // Initialize state only once when entering edit mode
  useEffect(() => {
    if (returnRecord && isEditing && !customerName) {
      // Only set if not already edited
      setCustomerName(returnRecord.customerName);
      setSelectedItems(returnRecord.items.map((item) => ({ ...item })));
      setReturnDate(new Date(returnRecord.date).toISOString().split("T")[0]);
      setReturnImageUrl(returnRecord.returnImageUrl || ""); // Load image if exists
    }
  }, [returnRecord, isEditing]);

  if (!returnRecord) return <div>{t("Return record not found!")}</div>;

  const handleAddItem = () => {
    if (currentItem.itemId && currentItem.returnedQty) {
      const itemId = parseInt(currentItem.itemId, 10);
      const item = inventory?.find((i) => i.id === itemId);
      if (!item) {
        alert(t("Item not found in inventory"));
        return;
      }
      setSelectedItems([
        ...selectedItems,
        {
          ...item,
          returnedQty: parseInt(currentItem.returnedQty),
          bonusQty: parseInt(currentItem.bonusQty) || 0,
        },
      ]);
      setCurrentItem({ itemId: "", returnedQty: "", bonusQty: "" });
    }
  };

  const handleEditItemQty = (index, field, value) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: parseInt(value) || 0,
    };
    setSelectedItems(updatedItems);
  };

  const handleSave = async () => {
    if (!customerName || selectedItems.length === 0 || !returnDate) {
      alert(t("Please provide a customer name, items, and return date"));
      return;
    }
    if (!inventory) {
      alert(t("Inventory data is not available. Please try again later."));
      return;
    }

    // Restore original quantities to inventory (subtract since it was added back)
    const restoredInventory = inventory.map((item) => {
      const originalItem = returnRecord.items.find((si) => si.id === item.id);
      return originalItem
        ? {
            ...item,
            qty: item.qty - (originalItem.returnedQty + originalItem.bonusQty),
          }
        : item;
    });

    // Add new quantities to inventory
    const updatedInventory = restoredInventory.map((item) => {
      const returnedItem = selectedItems.find((si) => si.id === item.id);
      return returnedItem
        ? {
            ...item,
            qty: item.qty + (returnedItem.returnedQty + returnedItem.bonusQty),
          }
        : item;
    });

    const updatedReturn = {
      ...returnRecord,
      customerName,
      date: new Date(returnDate).toISOString(),
      items: selectedItems,
      total: selectedItems.reduce(
        (acc, item) => acc + item.returnedQty * item.price,
        0
      ),
      returnImageUrl, // Save return image
    };

    const updatedReturnHistory = returnHistory.map((rec) =>
      rec.id === returnRecord.id ? updatedReturn : rec
    );
    setReturnHistory(updatedReturnHistory);
    setInventory(updatedInventory);

    const returnHistoryRef = ref(realtimeDb, `users/${user.uid}/returnHistory`);
    const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
    await Promise.all([
      set(returnHistoryRef, updatedReturnHistory),
      set(inventoryRef, updatedInventory),
    ]).catch((error) => console.error("Error syncing data:", error));

    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(t("Are you sure you want to delete this return record?"))
    ) {
      if (!inventory) {
        alert(t("Inventory data is not available. Please try again later."));
        return;
      }

      const updatedInventory = inventory.map((item) => {
        const returnItem = returnRecord.items.find((si) => si.id === item.id);
        return returnItem
          ? {
              ...item,
              qty: item.qty - (returnItem.returnedQty + returnItem.bonusQty),
            }
          : item;
      });

      const updatedReturnHistory = returnHistory.filter(
        (rec) => rec.id !== returnRecord.id
      );
      setReturnHistory(updatedReturnHistory);
      setInventory(updatedInventory);

      const returnHistoryRef = ref(
        realtimeDb,
        `users/${user.uid}/returnHistory`
      );
      const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
      await Promise.all([
        set(returnHistoryRef, updatedReturnHistory),
        set(inventoryRef, updatedInventory),
      ]).catch((error) => console.error("Error syncing data:", error));
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        {t("Return Details")}
      </h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
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
              type="date"
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
            <input
              type="text"
              className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
              placeholder={t("Return Image URL (Optional)")}
              value={returnImageUrl}
              onChange={(e) => setReturnImageUrl(e.target.value)}
            />
            {returnImageUrl && (
              <div className="mb-4">
                <p>{t("Return Image Preview")}</p>
                <img
                  src={returnImageUrl}
                  alt="Return Preview"
                  className="w-32 h-32 object-cover"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/128")
                  }
                />
              </div>
            )}
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
                placeholder={t("Returned Quantity")}
                value={currentItem.returnedQty}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    returnedQty: e.target.value,
                  })
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
              <h3 className="font-semibold">{t("Items Returned")}</h3>
              <ul className="list-disc pl-6">
                {selectedItems.map((item, index) => (
                  <li key={index} className="mb-4">
                    {item.name} -{" "}
                    <input
                      type="number"
                      className="p-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-20 inline"
                      value={item.returnedQty}
                      onChange={(e) =>
                        handleEditItemQty(index, "returnedQty", e.target.value)
                      }
                    />{" "}
                    x ${item.price} (Bonus:{" "}
                    <input
                      type="number"
                      className="p-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-20 inline"
                      value={item.bonusQty}
                      onChange={(e) =>
                        handleEditItemQty(index, "bonusQty", e.target.value)
                      }
                    />
                    )
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold mb-4">
              Customer: {returnRecord.customerName}
            </h3>
            <p className="mb-4">
              Date: {new Date(returnRecord.date).toLocaleDateString()}
            </p>
            {returnRecord.returnImageUrl && (
              <div className="mb-4">
                <p>{t("Return Image")}</p>
                <img
                  src={returnRecord.returnImageUrl}
                  alt="Return"
                  className="w-32 h-32 object-cover"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/128")
                  }
                />
              </div>
            )}
            <h4 className="font-semibold">Items Returned:</h4>
            <ul className="list-disc pl-6">
              {returnRecord.items.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.returnedQty} x ${item.price.toFixed(2)}{" "}
                  (Bonus: {item.bonusQty})
                </li>
              ))}
            </ul>
            <div className="mt-4 font-semibold">
              <p>Total Refund: ${returnRecord.total.toFixed(2)}</p>
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

export default ReturnDetails;
