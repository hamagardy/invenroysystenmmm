import React, { useState } from "react";
import { ref, set } from "firebase/database";
import { realtimeDb } from "./firebase"; // Ensure firebase is imported

function RuinItems({ inventory, setInventory, setRuinedItems, user }) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [ruinQty, setRuinQty] = useState("");

  const handleRuinItem = async () => {
    if (typeof setRuinedItems !== "function") {
      console.error("setRuinedItems is not a function. Check props in App.js.");
      alert("Error: Unable to update ruined items. Contact support.");
      return;
    }

    const password = prompt("Enter password to confirm:");
    if (password !== "admin123") {
      alert("Incorrect password!");
      return;
    }

    const qty = parseInt(ruinQty, 10);
    if (!selectedItemId || isNaN(qty) || qty <= 0) {
      alert("Please select an item and enter a valid quantity.");
      return;
    }

    const item = inventory.find((i) => i.id === Number(selectedItemId));
    if (!item || item.qty < qty) {
      alert("Not enough quantity in inventory or item not found!");
      return;
    }

    // Update inventory
    const updatedInventory = inventory.map((i) =>
      i.id === item.id ? { ...i, qty: i.qty - qty } : i
    );
    setInventory(updatedInventory);

    // Sync with Firebase
    if (user?.uid) {
      const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
      await set(inventoryRef, updatedInventory).catch((error) => {
        console.error("Error syncing inventory:", error);
        alert("Failed to sync ruined item to database");
      });
    }

    // Update ruined items
    setRuinedItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, ruinedQty: i.ruinedQty + qty } : i
        );
      }
      return [...prev, { ...item, qty: item.qty - qty, ruinedQty: qty }];
    });

    alert("Item marked as ruined successfully!");
    setSelectedItemId("");
    setRuinQty("");
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        Ruin Items
      </h2>
      <div className="flex flex-col gap-4 max-w-md">
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select an item</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (Qty: {item.qty})
            </option>
          ))}
        </select>
        <input
          type="number"
          value={ruinQty}
          onChange={(e) => setRuinQty(e.target.value)}
          placeholder="Enter quantity to ruin"
          className="p-2 border rounded"
          min="1"
        />
        <button
          onClick={handleRuinItem}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Ruin Item
        </button>
      </div>
    </div>
  );
}

export default RuinItems;
