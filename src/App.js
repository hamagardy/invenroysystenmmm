import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { Home, Plus, Cog, FileText, Package, LogOut } from "lucide-react";
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import "./styles.css";
import DashboardAndHomePage from "./DashboardAndHomePage";
import CreateInvoice from "./CreateInvoice";
import SavedInvoices from "./SavedInvoices";
import InvoiceDetails from "./InvoiceDetails";
import Total from "./total";
import ReturnItems from "./ReturnItems";
import ReturnHistory from "./ReturnHistory";
import ReturnDetails from "./ReturnDetails";
import Login from "./Login";
import SignUp from "./signup";
import SettingsComponent from "./Settings";
import RuinItems from "./RuinIteams";
import RuinedItems from "./RuinedItems";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import { auth, realtimeDb } from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [ruinedItems, setRuinedItems] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarImage, setSidebarImage] = useState(
    "https://via.placeholder.com/40"
  );

  const syncDataToFirebase = useCallback(
    debounce((uid, data) => {
      if (!uid) return;
      const userRef = ref(realtimeDb, `users/${uid}`);
      set(userRef, {
        inventory: data.inventory || [],
        invoices: data.invoices || [],
        returnHistory: data.returnHistory || [],
        ruinedItems: data.ruinedItems || [],
        lastUpdated: new Date().toISOString(),
      }).catch((error) => console.error("Error syncing data:", error));
    }, 500),
    []
  );

  useEffect(() => {
    const sidebarImageRef = ref(realtimeDb, "appSettings/sidebarImage");
    onValue(
      sidebarImageRef,
      (snapshot) => {
        const savedImage = snapshot.val();
        if (savedImage) setSidebarImage(savedImage);
      },
      (error) => console.error("Error fetching sidebar image:", error)
    );
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        setIsLoading(true);
        const userRef = ref(realtimeDb, `users/${firebaseUser.uid}`);
        const unsubscribe = onValue(
          userRef,
          (snapshot) => {
            const data = snapshot.val() || {};
            setInventory(data.inventory || []);
            setInvoices(data.invoices || []);
            setReturnHistory(data.returnHistory || []);
            setRuinedItems(data.ruinedItems || []);
            setIsLoading(false);
          },
          (error) => {
            console.error("Error fetching data:", error);
            setIsLoading(false);
          }
        );
        return () => unsubscribe();
      } else {
        setUser(null);
        setInventory([]);
        setInvoices([]);
        setReturnHistory([]);
        setRuinedItems([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user?.uid && !isLoading) {
      syncDataToFirebase(user.uid, {
        inventory,
        invoices,
        returnHistory,
        ruinedItems,
      });
    }
  }, [
    user,
    isLoading,
    inventory,
    invoices,
    returnHistory,
    ruinedItems,
    syncDataToFirebase,
  ]);

  useEffect(() => {
    document.documentElement.dir =
      i18n.language === "ar" || i18n.language === "ku" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => document.removeEventListener("touchmove", preventZoom);
  }, []);

  const handleLanguageChange = (lng) => i18n.changeLanguage(lng);
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const handleImageChange = () => {
    const password = prompt(t("Enter password to change the image"));
    if (password === "img") {
      const newImageUrl = prompt(t("Enter new image URL"), sidebarImage);
      if (newImageUrl) {
        setSidebarImage(newImageUrl);
        const sidebarImageRef = ref(realtimeDb, "appSettings/sidebarImage");
        set(sidebarImageRef, newImageUrl).catch((error) =>
          console.error("Error saving sidebar image:", error)
        );
      }
    } else {
      alert(t("Incorrect password"));
    }
  };
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const isRTL = i18n.language === "ar" || i18n.language === "ku";

  return (
    <BrowserRouter>
      {user ? (
        <div className="flex min-h-screen">
          <Sidebar
            collapsed={isSidebarCollapsed}
            backgroundColor="#1a202c"
            width="260px"
            collapsedWidth="70px"
            rootStyles={{ color: "#e2e8f0", border: "none" }}
            rtl={isRTL}
          >
            <div className="sidebar-header p-4 flex flex-col items-center">
              <img
                src={sidebarImage}
                alt="Sidebar Icon"
                onClick={handleImageChange}
                className="w-12 h-12 rounded-full mb-2 cursor-pointer"
              />
              {!isSidebarCollapsed && (
                <>
                  <h1 className="text-white text-xl font-bold">
                    {t("Inventory System")}
                  </h1>
                  <div
                    className={`flex ${
                      isRTL ? "space-x-reverse space-x-2" : "space-x-2"
                    } mt-2`}
                  >
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`language-toggle ${
                        i18n.language === "en" ? "bg-blue-600" : ""
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange("ar")}
                      className={`language-toggle ${
                        i18n.language === "ar" ? "bg-blue-600" : ""
                      }`}
                    >
                      AR
                    </button>
                    <button
                      onClick={() => handleLanguageChange("ku")}
                      className={`language-toggle ${
                        i18n.language === "ku" ? "bg-blue-600" : ""
                      }`}
                    >
                      KU
                    </button>
                  </div>
                </>
              )}
            </div>
            <Menu
              menuItemStyles={{
                button: {
                  padding: "0.75rem 1.5rem",
                  "&:hover": { backgroundColor: "#2d3748" },
                  "&.active": { backgroundColor: "#3182ce", color: "#fff" },
                },
                icon: { marginRight: "1rem" },
              }}
            >
              <MenuItem icon={<Home />} component={<Link to="/" />}>
                {t("Dashboard")}
              </MenuItem>
              <MenuItem icon={<Plus />} component={<Link to="/invoice" />}>
                {t("Create Invoice")}
              </MenuItem>
              <MenuItem
                icon={<FileText />}
                component={<Link to="/saved-invoices" />}
              >
                {t("Saved Invoices")}
              </MenuItem>
              <MenuItem icon={<Package />} component={<Link to="/total" />}>
                {t("Total Items")}
              </MenuItem>
              <MenuItem icon={<Plus />} component={<Link to="/return-items" />}>
                {t("Return Items")}
              </MenuItem>
              <MenuItem
                icon={<FileText />}
                component={<Link to="/return-history" />}
              >
                {t("Return History")}
              </MenuItem>
              <MenuItem icon={<Plus />} component={<Link to="/ruin-items" />}>
                {t("Ruin Items")}
              </MenuItem>
              <MenuItem
                icon={<FileText />}
                component={<Link to="/ruined-items" />}
              >
                {t("Ruined Items")}
              </MenuItem>
              <MenuItem icon={<Cog />} component={<Link to="/settings" />}>
                {t("Settings")}
              </MenuItem>
              <MenuItem
                icon={<LogOut />}
                component={<Link to="/" onClick={handleLogout} />}
              >
                {t("Logout")}
              </MenuItem>
              <MenuItem
                icon={
                  isSidebarCollapsed ? (
                    <FontAwesomeIcon icon={faBars} />
                  ) : (
                    <FontAwesomeIcon icon={faTimes} />
                  )
                }
                onClick={toggleSidebar}
              >
                {isSidebarCollapsed ? t("Open Sidebar") : t("Close Sidebar")}
              </MenuItem>
            </Menu>
          </Sidebar>

          <main className="main-content">
            <div className="max-w-5xl">
              {isLoading ? (
                <div className="flex items-center justify-center h-screen">
                  <p className="text-2xl text-gray-700">{t("Loading")}</p>
                </div>
              ) : (
                <Routes>
                  <Route
                    path="/"
                    element={
                      <DashboardAndHomePage
                        user={user}
                        inventory={inventory}
                        invoices={invoices}
                        returnHistory={returnHistory}
                        ruinedItems={ruinedItems}
                      />
                    }
                  />
                  <Route
                    path="/invoice"
                    element={
                      <CreateInvoice
                        inventory={inventory}
                        setInventory={setInventory}
                        invoices={invoices}
                        setInvoices={setInvoices}
                      />
                    }
                  />
                  <Route
                    path="/saved-invoices"
                    element={<SavedInvoices invoices={invoices} />}
                  />
                  <Route
                    path="/invoice/:id"
                    element={
                      <InvoiceDetails
                        user={user}
                        invoices={invoices}
                        setInvoices={setInvoices}
                        inventory={inventory}
                        setInventory={setInventory}
                      />
                    }
                  />
                  <Route
                    path="/total"
                    element={
                      <Total
                        inventory={inventory}
                        setInventory={setInventory}
                        user={user} // Pass user prop to Total
                      />
                    }
                  />
                  <Route
                    path="/return-items"
                    element={
                      <ReturnItems
                        inventory={inventory}
                        setInventory={setInventory}
                        returnHistory={returnHistory}
                        setReturnHistory={setReturnHistory}
                      />
                    }
                  />
                  <Route
                    path="/return-history"
                    element={<ReturnHistory returnHistory={returnHistory} />}
                  />
                  <Route
                    path="/return-history/:id"
                    element={
                      <ReturnDetails
                        returnHistory={returnHistory}
                        setReturnHistory={setReturnHistory}
                        inventory={inventory}
                        setInventory={setInventory}
                        user={user}
                      />
                    }
                  />
                  <Route
                    path="/ruin-items"
                    element={
                      <RuinItems
                        inventory={inventory}
                        setInventory={setInventory}
                        setRuinedItems={setRuinedItems}
                      />
                    }
                  />
                  <Route
                    path="/ruined-items"
                    element={<RuinedItems ruinedItems={ruinedItems} />}
                  />
                  <Route
                    path="/settings"
                    element={
                      <SettingsComponent
                        inventory={inventory}
                        invoices={invoices}
                        returnHistory={returnHistory}
                        ruinedItems={ruinedItems}
                        setUser={setUser}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen p-4">
          <div className="w-full max-w-md card p-6">
            <Routes>
              <Route path="/" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
