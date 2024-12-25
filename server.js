const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

// Tworzenie aplikacji Express
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Połączenie z bazą danych SQLite (poprawiona ścieżka)
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Nie można połączyć z bazą danych:", err.message);
    } else {
        console.log("Połączono z bazą danych SQLite.");
    }
});

// Tworzenie tabeli użytkowników (jeśli nie istnieje)
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);

// Endpoint: Rejestracja użytkownika
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.run(query, [username, password], (err) => {
        if (err) {
            res.status(400).json({ error: "Nazwa użytkownika już istnieje!" });
        } else {
            res.json({ message: "Rejestracja zakończona sukcesem!" });
        }
    });
});

// Endpoint: Logowanie użytkownika
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";

    db.get(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Błąd serwera!" });
        } else if (row) {
            res.json({ message: "Logowanie udane!", user: row });
        } else {
            res.status(401).json({ error: "Nieprawidłowa nazwa użytkownika lub hasło!" });
        }
    });
});

// Start serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
