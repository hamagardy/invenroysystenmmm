import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function SavedInvoices({ invoices }) {
  const { t } = useTranslation();
  const [filterYear, setFilterYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const uniqueCustomers = [
    ...new Set(invoices.map((invoice) => invoice.customerName)),
  ];

  const filteredInvoices = () => {
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      const invoiceYear = invoiceDate.getFullYear();
      const invoiceMonth = invoiceDate.toLocaleString("default", {
        month: "long",
      });

      if (filterYear && invoiceYear !== parseInt(filterYear)) return false;
      if (selectedMonth && invoiceMonth !== selectedMonth) return false;
      if (filterCustomer && invoice.customerName !== filterCustomer)
        return false;
      return true;
    });
  };

  const months = [
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
  ];

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
        {t("Saved Invoices")}
      </h2>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md w-full">
        <div className="mb-4 flex flex-col gap-4">
          {/* Customer Dropdown */}
          <select
            className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-full"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <option value="">{t("Filter by Customer")}</option>
            {uniqueCustomers.map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-full"
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

          {/* Month Dropdown */}
          <select
            className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 w-full"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">{t("Filter by Month")}</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {t(month)}
              </option>
            ))}
          </select>
        </div>

        {/* Display filtered invoices */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-900 dark:text-slate-50">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-700">
                <th className="p-4 text-left">{t("Invoice ID")}</th>
                <th className="p-4 text-left">{t("Customer")}</th>
                <th className="p-4 text-left">{t("Date")}</th>
                <th className="p-4 text-left">{t("Total")}</th>
                <th className="p-4 text-left">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices().map((invoice) => (
                <tr key={invoice.id}>
                  <td className="p-4" data-label={t("Invoice ID")}>
                    {invoice.id}
                  </td>
                  <td className="p-4" data-label={t("Customer")}>
                    {invoice.customerName}
                  </td>
                  <td className="p-4" data-label={t("Date")}>
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="p-4" data-label={t("Total")}>
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="p-4" data-label={t("Actions")}>
                    <Link
                      to={`/invoice/${invoice.id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md block text-center"
                    >
                      {t("View Details")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SavedInvoices;
