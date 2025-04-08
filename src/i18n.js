// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // General (from previous)
      "Inventory System": "Inventory System",
      "Toggle Sidebar": "Toggle Sidebar",
      Dashboard: "Dashboard",
      "Create Invoice": "Create Invoice",
      "Saved Invoices": "Saved Invoices",
      "Total Items": "Total Items",
      "Return Items": "Return Items",
      "Return History": "Return History",
      "Ruin Items": "Ruin Items",
      "Ruined Items": "Ruined Items",
      Settings: "Settings",
      Logout: "Logout",
      Loading: "Loading...",

      // DashboardAndHomePage (from previous)
      "Dashboard & Home": "Dashboard & Home",
      "Baghdad Time": "Baghdad Time",
      "Recent Activity": "Recent Activity",
      "Show More": "Show More",
      "Show Less": "Show Less",
      "Return Created": "Return Created",
      "Item Ruined": "Item Ruined",
      "Invoice Created": "Invoice Created",
      Customer: "Customer",
      Quantity: "Quantity",
      Item: "Item",
      ID: "ID",
      "Total Stock": "Total Stock",
      "Total Stock Sold": "Total Stock Sold",
      "Total Returned Stock": "Total Returned Stock",
      "Total Ruined Stock": "Total Ruined Stock",

      // Settings (from previous)
      "Save Data": "Save Data",
      "Reset All Data": "Reset All Data",
      "User not authenticated": "User not authenticated.",
      "Data saved successfully":
        "Data saved successfully! It will be available on all devices.",
      "Failed to save data": "Failed to save data: {{message}}",
      "Enter password to reset all data": "Enter password to reset all data:",
      "Incorrect password": "Incorrect password! Data reset aborted.",
      "Confirm reset":
        "Are you sure you want to reset all data? This action cannot be undone.",
      "Data reset canceled": "Data reset canceled.",
      "Data reset successfully": "All data has been reset successfully!",
      "Failed to reset data": "Failed to reset data: {{message}}",

      // CreateInvoice
      "Not enough stock": "Not enough stock. Available: {{available}}",
      "Please provide a customer name, items, and invoice date":
        "Please provide a customer name, items, and invoice date.",
      "Customer Name": "Customer Name",
      "Select Item": "Select Item",
      "Bonus Quantity (Optional)": "Bonus Quantity (Optional)",
      "Add Item": "Add Item",
      Items: "Items",
      "Save Invoice": "Save Invoice",
      "in stock": "in stock",

      // SavedInvoices
      "Filter by Customer": "Filter by Customer",
      "Filter by Year": "Filter by Year",
      "Filter by Month": "Filter by Month",
      "Invoice ID": "Invoice ID",
      Date: "Date",
      Total: "Total",
      Actions: "Actions",
      "View Details": "View Details",

      // Total
      "Enter item name": "Enter item name:",
      "Enter quantity": "Enter quantity:",
      "Enter price": "Enter price:",
      "Please provide a valid name, quantity, and price":
        "Please provide a valid name, quantity, and price.",
      "Item added successfully": "Item added successfully!",
      "Enter password to edit item": "Enter password to edit item:",
      "Incorrect password edit": "Incorrect password! Edit aborted.",
      "Item not found": "Item not found!",
      "Enter new item name": "Enter new item name:",
      "Enter new quantity": "Enter new quantity:",
      "Item edited successfully": "Item edited successfully!",
      "Please provide a valid name and quantity":
        "Please provide a valid name and quantity.",
      "Enter password to delete item": "Enter password to delete item:",
      "Incorrect password delete": "Incorrect password! Delete aborted.",
      "Confirm delete": "Are you sure you want to delete this item?",
      "Delete canceled": "Delete canceled.",
      "Item deleted successfully": "Item deleted successfully!",
      "No items in inventory yet": "No items in inventory yet. Add some above!",
      Name: "Name",
      Price: "Price",
      Edit: "Edit",
      Delete: "Delete",

      // ReturnItems
      "Create Return": "Create Return",
      "Return created successfully": "Return created successfully!",
      "Item not found": "Item not found.",
      "Please provide a customer name, items, and return date":
        "Please provide a customer name, items, and return date.",
      "Save Return": "Save Return",
    },
  },
  ar: {
    translation: {
      // General
      "Inventory System": "نظام الجرد",
      "Toggle Sidebar": "تبديل الشريط الجانبي",
      Dashboard: "لوحة التحكم",
      "Create Invoice": "إنشاء فاتورة",
      "Saved Invoices": "الفواتير المحفوظة",
      "Total Items": "إجمالي العناصر",
      "Return Items": "إرجاع العناصر",
      "Return History": "سجل الإرجاع",
      "Ruin Items": "تلف العناصر",
      "Ruined Items": "العناصر التالفة",
      Settings: "الإعدادات",
      Logout: "تسجيل الخروج",
      Loading: "جارٍ التحميل...",

      // DashboardAndHomePage
      "Dashboard & Home": "لوحة التحكم والرئيسية",
      "Baghdad Time": "توقيت بغداد",
      "Recent Activity": "النشاط الأخير",
      "Show More": "عرض المزيد",
      "Show Less": "عرض أقل",
      "Return Created": "تم إنشاء المرتجع",
      "Item Ruined": "العنصر تالف",
      "Invoice Created": "تم إنشاء الفاتورة",
      Customer: "العميل",
      Quantity: "الكمية",
      Item: "العنصر",
      ID: "المعرف",
      "Total Stock": "إجمالي المخزون",
      "Total Stock Sold": "إجمالي المخزون المباع",
      "Total Returned Stock": "إجمالي المخزون المرتجع",
      "Total Ruined Stock": "إجمالي المخزون التالف",

      // Settings
      "Save Data": "حفظ البيانات",
      "Reset All Data": "إعادة تعيين كافة البيانات",
      "User not authenticated": "المستخدم غير مصادق عليه.",
      "Data saved successfully":
        "تم حفظ البيانات بنجاح! ستكون متاحة على جميع الأجهزة.",
      "Failed to save data": "فشل في حفظ البيانات: {{message}}",
      "Enter password to reset all data":
        "أدخل كلمة المرور لإعادة تعيين جميع البيانات:",
      "Incorrect password":
        "كلمة المرور غير صحيحة! تم إلغاء إعادة تعيين البيانات.",
      "Confirm reset":
        "هل أنت متأكد من إعادة تعيين جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.",
      "Data reset canceled": "تم إلغاء إعادة تعيين البيانات.",
      "Data reset successfully": "تم إعادة تعيين جميع البيانات بنجاح!",
      "Failed to reset data": "فشل في إعادة تعيين البيانات: {{message}}",

      // CreateInvoice
      "Not enough stock": "لا يوجد مخزون كافٍ. المتوفر: {{available}}",
      "Please provide a customer name, items, and invoice date":
        "يرجى تقديم اسم العميل والعناصر وتاريخ الفاتورة.",
      "Customer Name": "اسم العميل",
      "Select Item": "اختر عنصر",
      "Bonus Quantity (Optional)": "كمية المكافأة (اختياري)",
      "Add Item": "إضافة عنصر",
      Items: "العناصر",
      "Save Invoice": "حفظ الفاتورة",
      "in stock": "في المخزون",

      // SavedInvoices
      "Filter by Customer": "تصفية حسب العميل",
      "Filter by Year": "تصفية حسب السنة",
      "Filter by Month": "تصفية حسب الشهر",
      "Invoice ID": "معرف الفاتورة",
      Date: "التاريخ",
      Total: "المجموع",
      Actions: "الإجراءات",
      "View Details": "عرض التفاصيل",

      // Total
      "Enter item name": "أدخل اسم العنصر:",
      "Enter quantity": "أدخل الكمية:",
      "Enter price": "أدخل السعر:",
      "Please provide a valid name, quantity, and price":
        "يرجى تقديم اسم وكمية وسعر صالحين.",
      "Item added successfully": "تمت إضافة العنصر بنجاح!",
      "Enter password to edit item": "أدخل كلمة المرور لتعديل العنصر:",
      "Incorrect password edit": "كلمة المرور غير صحيحة! تم إلغاء التعديل.",
      "Item not found": "العنصر غير موجود!",
      "Enter new item name": "أدخل اسم العنصر الجديد:",
      "Enter new quantity": "أدخل الكمية الجديدة:",
      "Item edited successfully": "تم تعديل العنصر بنجاح!",
      "Please provide a valid name and quantity":
        "يرجى تقديم اسم وكمية صالحين.",
      "Enter password to delete item": "أدخل كلمة المرور لحذف العنصر:",
      "Incorrect password delete": "كلمة المرور غير صحيحة! تم إلغاء الحذف.",
      "Confirm delete": "هل أنت متأكد من حذف هذا العنصر؟",
      "Delete canceled": "تم إلغاء الحذف.",
      "Item deleted successfully": "تم حذف العنصر بنجاح!",
      "No items in inventory yet":
        "لا توجد عناصر في المخزون بعد. أضف بعض العناصر أعلاه!",
      Name: "الاسم",
      Price: "السعر",
      Edit: "تعديل",
      Delete: "حذف",

      // ReturnItems
      "Create Return": "إنشاء مرتجع",
      "Return created successfully": "تم إنشاء المرتجع بنجاح!",
      "Item not found": "العنصر غير موجود.",
      "Please provide a customer name, items, and return date":
        "يرجى تقديم اسم العميل والعناصر وتاريخ الإرجاع.",
      "Save Return": "حفظ المرتجع",
    },
  },
  ku: {
    translation: {
      // General
      "Inventory System": "سستەمی کۆگا",
      "Toggle Sidebar": "گۆڕینی شرۆڤەی لاتەنیشت",
      Dashboard: "داشبۆرد",
      "Create Invoice": "دروستکردنی فاتورە",
      "Saved Invoices": "فاتورە پاراستەکان",
      "Total Items": "کۆی گشتی ئایتمەکان",
      "Return Items": "گەڕاندنەوەی ئایتمەکان",
      "Return History": "مێژووی گەڕاندنەوە",
      "Ruin Items": "ئایتمەکانەی خراپە",
      "Ruined Items": "شتە خراپەکان",
      Settings: "ڕێکخستنەکان",
      Logout: "چوونەدەرەوە",
      Loading: "بارکردن...",

      // DashboardAndHomePage
      "Dashboard & Home": "داشبۆرد و ماڵەوە",
      "Erbil Time": "کاتی هەولێر",
      "Recent Activity": "چالاکیەکانی ئەم دواییە",
      "Show More": "زیاتر پیشان بدە",
      "Show Less": "کەمتر پیشان بدە",
      "Return Created": "گەڕاندنەوە دروستکرا",
      "Item Ruined": "شتەکە خراپ بوو",
      "Invoice Created": "فاتورە دروستکرا",
      Customer: "کڕیار",
      Quantity: "کەرگە",
      Item: "ئایتم",
      ID: "ناسنامە",
      "Total Stock": "کۆی گشتی کۆگا",
      "Total Stock Sold": "کۆی گشتی  فرۆشراو",
      "Total Returned Stock": "کۆی گشتی  گەڕاوە",
      "Total Ruined Stock": "کۆی گشتی تەلەفەکان",

      // Settings
      "Save Data": "پاراستنی داتا",
      "Reset All Data": "ڕیسێتکردنی هەموو داتا",
      "User not authenticated": "بەکارهێنەر نەناسراوە.",
      "Data saved successfully":
        "داتا بە سەرکەوتوویی پارێزراوە! لە سەر هەموو ئامێرەکان بەردەست دەبێت.",
      "Failed to save data": "نەتوانرا داتا پارێزراو بکات: {{message}}",
      "Enter password to reset all data":
        "وشەی نهێنی بنووسە بۆ ڕیسێتکردنی هەموو داتا:",
      "Incorrect password": "وشەی نهێنی هەڵەیە! ڕیسێتکردنی داتا بەتاڵ کرا.",
      "Confirm reset":
        "ئایا دڵنیایت لە ڕیسێتکردنی هەموو داتا؟ ئەم کردارە ناکرێت بگەڕێندرێتەوە.",
      "Data reset canceled": "ڕیسێتکردنی داتا بەتاڵ کرا.",
      "Data reset successfully": "هەموو داتا بە سەرکەوتوویی ڕیسێت کرا!",
      "Failed to reset data": "نەتوانرا داتا ڕیسێت بکرێت: {{message}}",

      // CreateInvoice
      "Not enough stock": "کۆگای پێویست نییە. بەردەستە: {{available}}",
      "Please provide a customer name, items, and invoice date":
        "تکایە ناوی کڕیار و ئایتمەکان و بەرواری فاتورەەکە بنووسە.",
      "Customer Name": "ناوی کڕیار",
      "Select Item": "شتەیەک هەڵبژێرە",
      "Bonus Quantity (Optional)": "کەرگەی بۆنەس (ئارەزوومەندانە)",
      "Add Item": "شتە زیاد بکە",
      Items: "ئایتمەکان",
      "Save Invoice": "فاتورە پاراستن",
      "in stock": "لە کۆگادا",

      // SavedInvoices
      "Filter by Customer": "پاڵاوتن بەپێی کڕیار",
      "Filter by Year": "پاڵاوتن بەپێی ساڵ",
      "Filter by Month": "پاڵاوتن بەپێی مانگ",
      "Invoice ID": "ناسنامەی فاتورە",
      Date: "بەروار",
      Total: "کۆی گشتی",
      Actions: "کردارەکان",
      "View Details": "بینینی وردەکاریەکان",

      // Total
      "Enter item name": "ناوی شتەکە بنووسە:",
      "Enter quantity": "کەرگە بنووسە:",
      "Enter price": "نرخ بنووسە:",
      "Please provide a valid name, quantity, and price":
        "تکایە ناو، کەرگە، و نرخێکی دروست بنووسە.",
      "Item added successfully": "شتە بە سەرکەوتوویی زیاد کرا!",
      "Enter password to edit item":
        "وشەی نهێنی بنووسە بۆ دەستکاریکردنی شتەکە:",
      "Incorrect password edit": "وشەی نهێنی هەڵەیە! دەستکاری بەتاڵ کرا.",
      "Item not found": "شتەکە نەدۆزرایەوە!",
      "Enter new item name": "ناوی شتەی نوێ بنووسە:",
      "Enter new quantity": "کەرگەی نوێ بنووسە:",
      "Item edited successfully": "شتە بە سەرکەوتوویی دەستکاری کرا!",
      "Please provide a valid name and quantity":
        "تکایە ناو و کەرگەیەکی دروست بنووسە.",
      "Enter password to delete item": "وشەی نهێنی بنووسە بۆ سڕینەوەی شتەکە:",
      "Incorrect password delete": "وشەی نهێنی هەڵەیە! سڕینەوە بەتاڵ کرا.",
      "Confirm delete": "ئایا دڵنیایت لە سڕینەوەی ئەم شتە؟",
      "Delete canceled": "سڕینەوە بەتاڵ کرا.",
      "Item deleted successfully": "شتە بە سەرکەوتوویی سڕایەوە!",
      "No items in inventory yet":
        "هێشتا هیچ شتێک لە کۆگادا نییە. لە سەرەوە شتە زیاد بکە!",
      Name: "ناو",
      Price: "نرخ",
      Edit: "دەستکاری",
      Delete: "سڕینەوە",

      // ReturnItems
      "Create Return": "دروستکردنی گەڕاندنەوە",
      "Return created successfully": "گەڕاندنەوە بە سەرکەوتوویی دروست کرا!",
      "Item not found": "شتەکە نەدۆزرایەوە.",
      "Please provide a customer name, items, and return date":
        "تکایە ناوی کڕیار و ئایتمەکان و بەرواری گەڕاندنەوە بنووسە.",
      "Save Return": "پاراستنی گەڕاندنەوە",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
