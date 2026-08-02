const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("🚀 Backend is working on Railway!");
});

app.get("/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "OK",
            database: "Connected",
            time: result.rows[0].now,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            status: "Database Error",
            error: err.message,
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});