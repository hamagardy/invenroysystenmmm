import React, { useState, useEffect } from "react";

function ItemExpires({ inventory, setInventory, setExpiredItems }) {
  const [selectedItem, setSelectedItem] = useState({ itemId: "", qty: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveExpiration = () => {
    if (selectedItem.itemId && selectedItem.qty) {
      const itemId = parseInt(selectedItem.itemId, 10);
      const itemToExpire = inventory.find((item) => item.id === itemId);
      const qtyToExpire = parseInt(selectedItem.qty, 10);

      if (!itemToExpire) {
        alert("Item not found.");
        return;
      }

      if (isNaN(qtyToExpire) || qtyToExpire <= 0) {
        alert("Please enter a valid quantity.");
        return;
      }

      if (qtyToExpire > itemToExpire.qty) {
        alert("Not enough stock.");
        return;
      }

      // Update inventory by decreasing qty
      const updatedInventory = inventory.map((item) =>
        item.id === itemId ? { ...item, qty: item.qty - qtyToExpire } : item
      );

      // Create expired item entry with detailed info
      const expiredItem = {
        id: Date.now(), // Unique ID for the expired entry
        name: itemToExpire.name,
        expiredQty: qtyToExpire,
        price: itemToExpire.price, // Include price for details
        date: new Date().toISOString(), // Exact expiration timestamp
      };

      // Update state, triggering Firebase sync via App.js
      setExpiredItems((prev) => [...prev, expiredItem]);
      setInventory(updatedInventory);
      setSelectedItem({ itemId: "", qty: "" });
      setSuccessMessage("Expiration recorded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert("Please select an item and provide a quantity.");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        Manage Expired Items
      </h2>
      {successMessage && (
        <div className="bg-green-500 text-white p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <select
          className="mb-4 p-2 w-full"
          value={selectedItem.itemId}
          onChange={(e) =>
            setSelectedItem({ ...selectedItem, itemId: e.target.value })
          }
        >
          <option value="">Select Item</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.qty} in stock
            </option>
          ))}
        </select>
        <input
          type="number"
          className="mb-4 p-2 w-full"
          placeholder="Quantity to Expire"
          value={selectedItem.qty}
          onChange={(e) =>
            setSelectedItem({ ...selectedItem, qty: e.target.value })
          }
        />
        <button
          onClick={handleSaveExpiration}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Save Expiration
        </button>
      </div>
    </div>
  );
}

export default ItemExpires;
