import React, { useEffect, useRef } from "react";
import { ref, set, onValue } from "firebase/database";
import { realtimeDb } from "./firebase";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Total({ inventory, setInventory, user }) {
  const { t } = useTranslation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
    onValue(
      inventoryRef,
      (snapshot) => {
        const data = snapshot.val();
        setInventory(data || []);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
      }
    );
  }, [user, setInventory]);

  const handleAddItem = async () => {
    const name = prompt(t("Enter item name"));
    const qty = parseInt(prompt(t("Enter quantity")), 10);
    const price = parseFloat(prompt(t("Enter price")));
    if (name && qty > 0 && price > 0) {
      const newItem = { id: Date.now(), name, qty, price };
      const updatedInventory = [...inventory, newItem];
      setInventory(updatedInventory);
      if (user?.uid) {
        const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
        await set(inventoryRef, updatedInventory).catch((error) =>
          console.error("Error syncing inventory:", error)
        );
      }
      alert(t("Item added successfully"));
    } else {
      alert(t("Please provide a valid name, quantity, and price"));
    }
  };

  const handleEditItem = async (itemId) => {
    const password = prompt(t("Enter password to edit item"));
    if (password !== "admino") {
      alert(t("Incorrect password edit"));
      return;
    }
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newName = prompt(t("Enter new item name"), item.name);
    const newQty = parseInt(prompt(t("Enter new quantity"), item.qty), 10);
    if (newName && !isNaN(newQty) && newQty >= 0) {
      const updatedInventory = inventory.map((i) =>
        i.id === itemId ? { ...i, name: newName, qty: newQty } : i
      );
      setInventory(updatedInventory);
      if (user?.uid) {
        const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
        await set(inventoryRef, updatedInventory).catch((error) =>
          console.error("Error syncing inventory:", error)
        );
      }
      alert(t("Item edited successfully"));
    } else {
      alert(t("Please provide a valid name and quantity"));
    }
  };

  const handleDeleteItem = async (itemId) => {
    const password = prompt(t("Enter password to delete item"));
    if (password !== "admino") {
      alert(t("Incorrect password delete"));
      return;
    }
    if (!window.confirm(t("Confirm delete"))) {
      alert(t("Delete canceled"));
      return;
    }
    const updatedInventory = inventory.filter((i) => i.id !== itemId);
    setInventory(updatedInventory);
    if (user?.uid) {
      const inventoryRef = ref(realtimeDb, `users/${user.uid}/inventory`);
      await set(inventoryRef, updatedInventory).catch((error) =>
        console.error("Error syncing inventory:", error)
      );
    }
    alert(t("Item deleted successfully"));
  };

  const totalStock = inventory.reduce((sum, item) => sum + item.qty, 0);
  const totalItems = inventory.length;

  const handleExportPDF = () => {
    const input = contentRef.current;
    if (!input) {
      alert("Error: Content not found");
      return;
    }

    // Hide action column for PDF
    const actionCells = input.querySelectorAll(".action-cell");
    actionCells.forEach((cell) => (cell.style.display = "none"));

    html2canvas(input, { scale: 2, useCORS: true, logging: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width / 2; // Adjusted for scale: 2
        const imgHeight = canvas.height / 2;
        const scaleFactor = pageWidth / imgWidth;
        const scaledHeight = Math.min(imgHeight * scaleFactor, pageHeight - 20);

        pdf.setFontSize(14);
        pdf.text("Inventory System By @Hamagardy", pageWidth / 2, 10, {
          align: "center",
        });
        pdf.addImage(imgData, "PNG", 0, 15, pageWidth, scaledHeight);
        pdf.save("inventory_total.pdf");

        // Restore action column
        actionCells.forEach((cell) => (cell.style.display = ""));
      })
      .catch((error) => {
        console.error("PDF export error:", error);
        alert("Error: Failed to export PDF");
        // Restore action column in case of error
        actionCells.forEach((cell) => (cell.style.display = ""));
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-800">
      <div
        ref={contentRef}
        className="w-full max-w-[90%] md:max-w-3xl lg:max-w-5xl bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md text-gray-900 dark:text-slate-50"
      >
        <h2 className="text-3xl font-bold mb-6">{t("Total Items")}</h2>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            {t("Add Item")}
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            {t("Export to PDF")}
          </button>
        </div>
        {inventory.length === 0 ? (
          <p className="text-gray-700 dark:text-slate-300">
            {t("No items in inventory yet")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-700">
                  <th className="p-4 text-left">{t("ID")}</th>
                  <th className="p-4 text-left">{t("Name")}</th>
                  <th className="p-4 text-left">{t("Quantity")}</th>
                  <th className="p-4 text-left">{t("Price")}</th>
                  <th className="p-4 text-left">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4">{item.id}</td>
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.qty}</td>
                    <td className="p-4">${item.price.toFixed(2)}</td>
                    <td className="p-4 action-cell">
                      <button
                        onClick={() => handleEditItem(item.id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2"
                      >
                        {t("Edit")}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md"
                      >
                        {t("Delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 dark:bg-slate-700 font-bold">
                  <td colSpan="2" className="p-4 text-left">
                    {t("Total Items")}: {totalItems}
                  </td>
                  <td className="p-4 text-left">
                    {t("Total Stock")}: {totalStock}
                  </td>
                  <td colSpan="2" className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Total;
