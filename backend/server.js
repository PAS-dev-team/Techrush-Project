const express = require("express");

const app = express();

// Railway provides PORT automatically
const PORT = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
    res.send("🚀 Railway deployment successful!");
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});