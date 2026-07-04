const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const db = new sqlite3.Database("users.db");

// Create users table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
        "admin",
        "1234",
      ]);
    }
  });
});

// Secure Login (Prepared Statement)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (row) {
        res.send("✅ Login Successful");
      } else {
        res.send("❌ Invalid Username or Password");
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});