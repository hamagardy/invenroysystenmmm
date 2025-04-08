import React, { useEffect, useRef } from "react";
import { ref, set, onValue } from "firebase/database";
import { realtimeDb } from "./firebase";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Total({ inventory, setInventory, user }) {
  const { t } = useTranslation();
  const contentRef = useRef(null);
  const pdfContentRef = useRef(null);

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
    if (!item) {
      alert(t("Item not found"));
      return;
    }

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

    const confirmDelete = window.confirm(t("Confirm delete"));
    if (!confirmDelete) {
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
    const input = pdfContentRef.current;
    if (!input) {
      console.error("PDF content ref is not available");
      alert("Error: PDF content not found");
      return;
    }

    console.log("Starting PDF export...");
    html2canvas(input, { scale: 3, useCORS: true, logging: true }) // Increased scale for better resolution
      .then((canvas) => {
        console.log("Canvas generated:", canvas);
        const imgData = canvas.toDataURL("image/png", 1.0); // Ensure high quality
        console.log("Image data length:", imgData.length);

        if (!imgData || imgData === "data:,") {
          console.error("Invalid image data from html2canvas");
          alert("Error: Could not generate image data");
          return;
        }

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width / 3; // Adjusted for scale: 3
        const imgHeight = canvas.height / 3;

        const scaleFactor = pageWidth / imgWidth;
        let scaledHeight = imgHeight * scaleFactor;

        if (scaledHeight > pageHeight - 20) {
          scaledHeight = pageHeight - 20;
          console.log("Height capped at:", scaledHeight);
        }

        pdf.setFontSize(14); // Slightly smaller title font
        pdf.text("Inventory System By @Hamagardy", pageWidth / 2, 10, {
          align: "center",
        });

        console.log("Adding image to PDF...");
        pdf.addImage(imgData, "PNG", 0, 15, pageWidth, scaledHeight);
        console.log("Saving PDF...");
        pdf.save("inventory_total.pdf");
        console.log("PDF export completed");
      })
      .catch((error) => {
        console.error("Error during PDF export:", error);
        alert("Error: Failed to export PDF");
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-800">
      {/* Main UI Content */}
      <div
        ref={contentRef}
        className="w-full max-w-[90%] md:max-w-3xl lg:max-w-5xl bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
          {t("Total Items")}
        </h2>
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
            <table className="w-full text-gray-900 dark:text-slate-50">
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
                    <td className="p-4">
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

      {/* Hidden PDF-specific content */}
      <div
        ref={pdfContentRef}
        className="absolute top-[-9999px] left-[-9999px] w-[190mm] bg-white p-4 text-gray-900"
        style={{ fontSize: "10px", lineHeight: "1.2" }} // Smaller font size and tighter line height
      >
        <h2 className="text-xl font-bold mb-4">{t("Total Items")}</h2>
        {inventory.length === 0 ? (
          <p>{t("No items in inventory yet")}</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left border">{t("ID")}</th>
                <th className="p-1 text-left border">{t("Name")}</th>
                <th className="p-1 text-left border">{t("Quantity")}</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="p-1 border">{item.id}</td>
                  <td className="p-1 border">{item.name}</td>
                  <td className="p-1 border">{item.qty}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="p-1 text-left border">
                  {t("Total Items")}: {totalItems}
                </td>
                <td className="p-1 text-left border">
                  {t("Total Stock")}: {totalStock}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

export default Total;
