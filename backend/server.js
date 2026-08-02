const express = require("express");
const crypto = require("crypto");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL PRIMARY KEY,
            fullname    TEXT NOT NULL,
            email       TEXT NOT NULL UNIQUE,
            password    TEXT NOT NULL,
            role        TEXT,
            created_at  TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

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

app.post("/api/register", async (req, res) => {
    try {
        const { fullname, email, password } = req.body || {};

        if (!fullname || !email || !password) {
            return res.status(400).json({ error: "fullname, email and password are required" });
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        const hashed = hashPassword(password);

        const result = await pool.query(
            "INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3) RETURNING id, fullname, email, role, created_at",
            [fullname, email, hashed]
        );

        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);

        res.status(500).json({ error: err.message });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: "email and password are required" });
        }

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.json({
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({ error: err.message });
    }
});

app.post("/api/role", async (req, res) => {
    try {
        const { email, role } = req.body || {};

        if (!email || !role) {
            return res.status(400).json({ error: "email and role are required" });
        }

        const validRoles = ["attendee", "volunteer", "organizer"];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "role must be attendee, volunteer or organizer" });
        }

        const result = await pool.query(
            "UPDATE users SET role = $1 WHERE email = $2 RETURNING id, fullname, email, role, created_at",
            [role, email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);

        res.status(500).json({ error: err.message });
    }
});

initDb()
    .then(() => app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    }))
    .catch((err) => {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    });