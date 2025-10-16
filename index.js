const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
const bagsRoutes = require("./routes/v1/bags.js");
app.use("/api/v1/bags", bagsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/api/v1/bags", (req, res) => {
  const newBag = req.body;
// res.status(201).json(newBag);
});