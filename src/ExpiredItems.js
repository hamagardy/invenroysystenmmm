import React, { useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "./firebase";

function ExpiredItems({ expiredItems, setExpiredItems }) {
  useEffect(() => {
    const ruinedItemsRef = ref(realtimeDb, "ruinedItems");
    onValue(
      ruinedItemsRef,
      (snapshot) => {
        const data = snapshot.val();
        setExpiredItems(data || []);
      },
      (error) => {
        console.error("Error fetching ruined items:", error);
      }
    );
  }, [setExpiredItems]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        Expired Items
      </h2>
      <table className="min-w-full text-gray-900 dark:text-slate-50">
        <thead>
          <tr className="bg-gray-100 dark:bg-slate-700">
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Item Name</th>
            <th className="p-4 text-left">Quantity Expired</th>
            <th className="p-4 text-left">Price</th>
            <th className="p-4 text-left">Expiration Date</th>
          </tr>
        </thead>
        <tbody>
          {expiredItems.length > 0 ? (
            expiredItems.map((item) => (
              <tr key={item.id}>
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.expiredQty || item.ruinedQty}</td>
                <td className="p-4">
                  ${item.price ? item.price.toFixed(2) : "N/A"}
                </td>
                <td className="p-4">{new Date(item.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center">
                No expired items to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExpiredItems;
