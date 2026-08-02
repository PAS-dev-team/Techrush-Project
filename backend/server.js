const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

// Test route
app.get("/", (req, res) => {
    res.send("🚀 Backend is working on Railway!");
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running",
        port: PORT
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});