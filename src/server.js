const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Define Inventory Model
const Inventory = sequelize.define("Inventory", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Define Invoices Model
const Invoice = sequelize.define("Invoice", {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Sync database
sequelize.sync().then(() => console.log("Database synced"));

// API Routes
app.get("/api/inventory", async (req, res) => {
  const inventory = await Inventory.findAll();
  res.json(inventory);
});
a
app.post("/api/inventory", async (req, res) => {
  const { name, qty, price } = req.body;
  const newItem = await Inventory.create({ name, qty, price });
  res.status(201).json(newItem);
});

app.get("/api/invoices", async (req, res) => {
  const invoices = await Invoice.findAll();
  res.json(invoices);
});

app.post("/api/invoices", async (req, res) => {
  const { customerName, date, total } = req.body;
  const newInvoice = await Invoice.create({ customerName, date, total });
  res.status(201).json(newInvoice);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
