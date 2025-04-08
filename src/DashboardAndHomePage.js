import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DashboardAndHomePage({
  user,
  inventory,
  invoices,
  returnHistory,
  ruinedItems,
}) {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMoreLogs, setShowMoreLogs] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalItems = inventory.length;
  const totalStock = inventory.reduce((acc, item) => acc + item.qty, 0);
  const totalStockSold = (invoices || []).reduce((acc, invoice) => {
    if (invoice.type === "sale") {
      (invoice.items || []).forEach((item) => {
        acc += item.orderedQty || 0;
      });
    }
    return acc;
  }, 0);
  const totalReturnedStock = (returnHistory || []).reduce((acc, ret) => {
    if (ret.type === "return") {
      (ret.items || []).forEach((item) => {
        acc += item.returnedQty || 0;
      });
    }
    return acc;
  }, 0);
  const totalRuinedStock = (ruinedItems || []).reduce((acc, item) => {
    return acc + (item.ruinedQty || 0);
  }, 0);

  const allLogs = [
    ...(invoices || []),
    ...(returnHistory || []),
    ...(ruinedItems || []).map((item) => ({
      id: item.id,
      date: item.date || new Date().toISOString(),
      type: "ruined",
      customerName: "N/A",
      items: [{ name: item.name, ruinedQty: item.ruinedQty }],
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  const recentLogs = allLogs.slice(0, 5);

  // Chart Data
  const chartData = {
    labels: [t("Total Stock"), t("Sold"), t("Returned"), t("Ruined")],
    datasets: [
      {
        label: t("Stock Overview"),
        data: [
          totalStock,
          totalStockSold,
          totalReturnedStock,
          totalRuinedStock,
        ],
        backgroundColor: ["#48bb78", "#3182ce", "#f56565", "#ecc94b"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#2d3748" } },
      title: {
        display: true,
        text: t("Stock Overview"),
        color: "#2d3748",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#2d3748" },
        grid: { color: "#e2e8f0" },
      },
      x: {
        ticks: { color: "#2d3748" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h2 className="text-3xl font-bold mb-4 sm:mb-0">
          {t("Dashboard & Home")}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="card flex items-center p-3">
            <User className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-lg font-medium">{user?.email || "User"}</span>
          </div>
          <div className="card p-3 text-center">
            <p className="text-sm text-gray-600">{t("Erbil Time")}</p>
            <p className="text-lg font-semibold">
              {currentTime.toLocaleTimeString("en-US", {
                timeZone: "Asia/Baghdad",
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container mb-8">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          {
            label: t("Total Items"),
            value: totalItems,
            color: "bg-cyan-100 text-cyan-600",
          },
          {
            label: t("Total Stock"),
            value: totalStock,
            color: "bg-green-100 text-green-600",
          },
          {
            label: t("Total Stock Sold"),
            value: totalStockSold,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: t("Total Returned Stock"),
            value: totalReturnedStock,
            color: "bg-red-100 text-red-600",
          },
          {
            label: t("Total Ruined Stock"),
            value: totalRuinedStock,
            color: "bg-yellow-100 text-yellow-600",
          },
        ].map((stat, idx) => (
          <div key={idx} className={`card p-6 ${stat.color}`}>
            <p className={`${stat.color.split(" ")[1]} text-lg font-semibold`}>
              {stat.label}
            </p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{t("Recent Activity")}</h3>
          <button
            className="btn bg-blue-500"
            onClick={() => setShowMoreLogs(!showMoreLogs)}
          >
            {t(showMoreLogs ? "Show Less" : "Show More")}
          </button>
        </div>
        <ul className="space-y-4">
          {(showMoreLogs ? allLogs : recentLogs).map((log) => (
            <li
              key={log.id}
              className={`p-4 rounded-lg ${
                log.type === "return"
                  ? "bg-red-100 text-red-800"
                  : log.type === "ruined"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {log.type === "return" ? (
                <span>
                  {t("Return Created")} - {t("ID")}: {log.id}, {t("Customer")}:{" "}
                  {log.customerName}
                </span>
              ) : log.type === "ruined" ? (
                <span>
                  {t("Item Ruined")} - {t("ID")}: {log.id}, {t("Item")}:{" "}
                  {log.items[0].name}, {t("Quantity")}: {log.items[0].ruinedQty}
                </span>
              ) : (
                <span>
                  {t("Invoice Created")} - {t("ID")}: {log.id}, {t("Customer")}:{" "}
                  {log.customerName}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DashboardAndHomePage;
