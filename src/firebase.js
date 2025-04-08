// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD7GAfzgAE0Pu4zMYuK3O7OkqMUx_laqZM",
  authDomain: "pharma-sales-management.firebaseapp.com",
  databaseURL: "https://pharma-sales-management-default-rtdb.firebaseio.com",
  projectId: "pharma-sales-management",
  storageBucket: "pharma-sales-management.firebasestorage.app",
  messagingSenderId: "977665785441",
  appId: "1:977665785441:web:e817138d56fdc40fd47420",
  measurementId: "G-1SBJZHREEJ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const realtimeDb = getDatabase(app);

export { app, auth, realtimeDb };
