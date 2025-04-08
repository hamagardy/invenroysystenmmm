// Settings.js
import React from "react";
import { ref, set } from "firebase/database";
import { auth, realtimeDb } from "./firebase";
import { useTranslation } from "react-i18next";

function Settings({
  inventory,
  invoices,
  returnHistory,
  ruinedItems,
  setUser,
}) {
  const { t } = useTranslation();
  const user = auth.currentUser;

  const handleSaveData = async () => {
    if (!user) {
      alert(t("User not authenticated"));
      return;
    }

    try {
      const userRef = ref(realtimeDb, `users/${user.uid}`);
      const data = {
        inventory: inventory || [],
        invoices: invoices || [],
        returnHistory: returnHistory || [],
        ruinedItems: ruinedItems || [],
        lastUpdated: new Date().toISOString(),
      };
      await set(userRef, data);
      alert(t("Data saved successfully"));
    } catch (error) {
      console.error("Error saving data:", error);
      alert(t("Failed to save data", { message: error.message }));
    }
  };

  const handleResetData = async () => {
    if (!user) {
      alert(t("User not authenticated"));
      return;
    }

    const password = prompt(t("Enter password to reset all data"));
    if (password !== "admino") {
      alert(t("Incorrect password"));
      return;
    }

    const confirmReset = window.confirm(t("Confirm reset"));
    if (!confirmReset) {
      alert(t("Data reset canceled"));
      return;
    }

    try {
      const userRef = ref(realtimeDb, `users/${user.uid}`);
      const emptyData = {
        inventory: [],
        invoices: [],
        returnHistory: [],
        ruinedItems: [],
        lastUpdated: new Date().toISOString(),
      };
      await set(userRef, emptyData);
      alert(t("Data reset successfully"));
    } catch (error) {
      console.error("Error resetting data:", error);
      alert(t("Failed to reset data", { message: error.message }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        {t("Settings")}
      </h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={handleSaveData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {t("Save Data")}
        </button>
        <button
          onClick={handleResetData}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          {t("Reset All Data")}
        </button>
      </div>
    </div>
  );
}

export default Settings;
