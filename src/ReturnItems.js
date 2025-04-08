// ReturnItems.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function ReturnItems({
  inventory,
  setInventory,
  returnHistory = [],
  setReturnHistory,
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
          ...item,
          returnedQty: parseInt(currentItem.qty),
          bonusQty: parseInt(currentItem.bonusQty) || 0,
        },
      ]);
      setCurrentItem({ itemId: "", qty: "", bonusQty: "" });
    }
  };

  const handleSaveReturn = () => {
    if (customerName && selectedItems.length > 0 && returnDate) {
      let newReturnId = 1;
      if (returnHistory.some((record) => record.id === 1)) {
        newReturnId = Math.max(...returnHistory.map((record) => record.id)) + 1;
      }

      const newReturn = {
        id: newReturnId,
        customerName,
        date: new Date(returnDate).toISOString(),
        items: selectedItems,
        total: selectedItems.reduce(
          (acc, item) => acc + item.returnedQty * item.price,
          0
        ),
        type: "return",
      };

      const updatedInventory = localInventory.map((item) => {
        const returnedItem = selectedItems.find((si) => si.id === item.id);
        if (returnedItem) {
          return {
            ...item,
            qty: item.qty + returnedItem.returnedQty + returnedItem.bonusQty,
          };
        }
        return item;
      });

      const updatedReturnHistory = [...returnHistory, newReturn];
      localStorage.setItem(
        "returnHistory",
        JSON.stringify(updatedReturnHistory)
      );

      setReturnHistory(updatedReturnHistory);
      setInventory(updatedInventory);
      setLocalInventory(updatedInventory);
      setCustomerName("");
      setSelectedItems([]);
      setReturnDate("");

      setSuccessMessage(t("Return created successfully"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(t("Please provide a customer name, items, and return date"));
    }
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
                {item.name} - {item.returnedQty} x ${item.price} (Bonus:{" "}
                {item.bonusQty})
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
