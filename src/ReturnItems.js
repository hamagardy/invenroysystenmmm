import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ref, set } from "firebase/database";
import { realtimeDb } from "./firebase";

function ReturnItems({
  inventory,
  setInventory,
  returnHistory = [],
  setReturnHistory,
  user,
}) {
  const { t } = useTranslation();
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: "",
    qty: "",
    bonusQty: "",
  });
  const [returnDate, setReturnDate] = useState("");
  const [returnInvoiceNumber, setReturnInvoiceNumber] = useState(""); // Added return invoice number
  const [successMessage, setSuccessMessage] = useState("");
  const [localInventory, setLocalInventory] = useState(inventory || []);

  useEffect(() => {
    setLocalInventory(inventory);
  }, [inventory]);

  const handleAddItem = () => {
    if (currentItem.itemId && currentItem.qty) {
      const itemId = parseInt(currentItem.itemId, 10);
      const item = localInventory.find((i) => i.id === itemId);
      if (!item) {
        alert(t("Item not found"));
        return;
      }
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          returnedQty: parseInt(currentItem.qty),
          bonusQty: parseInt(currentItem.bonusQty) || 0,
        },
      ]);
      setCurrentItem({ itemId: "", qty: "", bonusQty: "" });
    } else {
      alert(t("Please select an item and specify a quantity"));
    }
  };

  const handleSaveReturn = async () => {
    if (
      !customerName ||
      selectedItems.length === 0 ||
      !returnDate ||
      !returnInvoiceNumber
    ) {
      alert(
        t(
          "Please provide a customer name, items, return date, and return invoice number"
        )
      );
      return;
    }

    const newReturnId =
      returnHistory.length > 0
        ? Math.max(...returnHistory.map((record) => record.id)) + 1
        : 1;
    const newReturn = {
      id: newReturnId,
      customerName,
      date: new Date(returnDate).toISOString(),
      items: selectedItems,
      total: selectedItems.reduce(
        (acc, item) => acc + item.returnedQty * item.price,
        0
      ),
      returnInvoiceNumber, // Added return invoice number
      type: "return",
    };

    const updatedInventory = localInventory.map((item) => {
      const returnedItem = selectedItems.find((si) => si.id === item.id);
      return returnedItem
        ? {
            ...item,
            qty: item.qty + returnedItem.returnedQty + returnedItem.bonusQty,
          }
        : item;
    });

    const updatedReturnHistory = [...returnHistory, newReturn];

    // Sync to Firebase
    if (user?.uid) {
      const returnHistoryRef = ref(
        realtimeDb,
        `users/${user.uid}/returnHistory`
      );
      const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
      try {
        await Promise.all([
          set(returnHistoryRef, updatedReturnHistory),
          set(inventoryRef, updatedInventory),
        ]);
      } catch (error) {
        console.error("Error syncing return data:", error);
        alert(t("Failed to save return to database"));
        return;
      }
    }

    setReturnHistory(updatedReturnHistory);
    setInventory(updatedInventory);
    setLocalInventory(updatedInventory);
    setCustomerName("");
    setSelectedItems([]);
    setReturnDate("");
    setReturnInvoiceNumber("");
    setSuccessMessage(t("Return created successfully"));
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        {t("Create Return")}
      </h2>
      {successMessage && (
        <div className="bg-green-500 text-white p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
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
          placeholder={t("Return Invoice Number")}
          value={returnInvoiceNumber}
          onChange={(e) => setReturnInvoiceNumber(e.target.value)}
        />
        <input
          type="date"
          className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
            value={currentItem.itemId}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, itemId: e.target.value })
            }
          >
            <option value="">{t("Select Item")}</option>
            {localInventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.qty} {t("in stock")}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
            placeholder={t("Returned Quantity")}
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
          className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
        >
          {t("Add Item")}
        </button>
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-slate-50">
            {t("Items")}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-slate-300">
            {selectedItems.map((item, index) => (
              <li key={index}>
                {item.name} - {item.returnedQty} x {item.price.toFixed(2)} IQD
                (Bonus: {item.bonusQty})
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={handleSaveReturn}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            {t("Save Return")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReturnItems;
