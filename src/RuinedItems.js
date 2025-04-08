// RuinedItems.js
import React from "react";

function RuinedItems({ ruinedItems }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        Ruined Items
      </h2>
      {ruinedItems.length === 0 ? (
        <p>No items have been marked as ruined yet.</p>
      ) : (
        <table className="min-w-full text-gray-900 dark:text-slate-50">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700">
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Ruined Quantity</th>
              <th className="p-4 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {ruinedItems.map((item) => (
              <tr key={item.id}>
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.ruinedQty}</td>
                <td className="p-4">${item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RuinedItems;
