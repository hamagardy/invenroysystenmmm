import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ReturnHistory({ returnHistory }) {
  const { t } = useTranslation();
  const [filterYear, setFilterYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");

  const filteredReturnHistory = returnHistory.filter((record) => {
    const returnDate = new Date(record.date);
    const returnYear = returnDate.getFullYear();
    const returnMonth = returnDate.toLocaleString("default", { month: "long" });
    return (
      (!filterYear || returnYear === parseInt(filterYear)) &&
      (!selectedMonth || returnMonth === selectedMonth) &&
      (!filterCustomer ||
        record.customerName
          .toLowerCase()
          .includes(filterCustomer.toLowerCase()))
    );
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-800">
      <div className="w-3/5 max-w-4xl bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
          {t("Return History")}
        </h2>
        <div className="mb-4">
          <select
            className="mr-4 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <option value="">{t("Filter by Customer")}</option>
            {[
              ...new Set(returnHistory.map((record) => record.customerName)),
            ].map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>
          <select
            className="mr-4 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">{t("Filter by Year")}</option>
            {[...Array(11)].map((_, i) => (
              <option key={i} value={2024 + i}>
                {2024 + i}
              </option>
            ))}
          </select>
          <select
            className="mr-4 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">{t("Filter by Month")}</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month) => (
              <option key={month} value={month}>
                {t(month)}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-900 dark:text-slate-50">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                <th className="p-4 text-left">{t("Return Invoice Number")}</th>
                <th className="p-4 text-left">{t("Customer")}</th>
                <th className="p-4 text-left">{t("Date")}</th>
                <th className="p-4 text-left">{t("Total")}</th>
                <th className="p-4 text-left">{t("Items")}</th>
                <th className="p-4 text-left">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturnHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    {t("No returns match your criteria")}
                  </td>
                </tr>
              ) : (
                filteredReturnHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b dark:border-slate-700"
                  >
                    <td className="p-4">
                      {record.returnInvoiceNumber || record.id}
                    </td>
                    <td className="p-4">{record.customerName}</td>
                    <td className="p-4">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">{record.total.toFixed(0)} IQD</td>
                    <td className="p-4">
                      {record.items.length} {t("items")}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/return-history/${record.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                      >
                        {t("View Details")}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReturnHistory;
