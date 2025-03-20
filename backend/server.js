const express = require('express');
// const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');


const app = express();

//TODO: Verbinde eine Datenbank dazu

// const db = new sqlite3.Database('./tasks.db');
app.use(cors());                // Middleware
app.use(bodyParser.json());     // Middleware (wie ein Übersetzer)


// db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, completed BOOLEAN DEFAULT 0)');


const pool = new Pool({
    user: process.env.DB_USER,         // Dein PostgreSQL-Benutzername
    host: process.env.DB_HOST,         // z. B. 'localhost'
    database: process.env.DB_NAME,     // Name deiner Datenbank
    password: process.env.DB_PASSWORD, // Dein Passwort
    port: process.env.DB_PORT, // Standardport für PostgreSQL
});


////

const createTable = async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          task TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      INSERT INTO users (username, email, password) VALUES ('testuser', 'test@example.com', 'hashedpassword');

      `);
      console.log("✅ Table 'users' created!");
    } catch (err) {
      console.error("❌ Error creating table:", err);
    } finally {
      client.release();
    }
  };
  
  createTable();

//TODO: Schreibe requests/responses


app.get('/', (req, res) => {
    res.send('genau'
);});


// Liste mir alle existierende Items
// hier sollte nur alle Items als JSON im Response geschrieben werden
app.get('/liste_abrufen', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Liste:", error);
    }
    });


// Wenn ein neues Item hinzugefügt werden soll, soll NodeJS Server diesen Request so behandeln:
app.post('/add', async (req, res) => {
    const result = await pool.query('INSERT INTO todos (task, user_id) VALUES ($1, 1) RETURNING *', [req.body.title]);
    res.json(result.rows[0])
});


app.delete('/delete/:id', async (req, res) => {
    try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [req.params.id,],);
    res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Löschen:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
})


app.patch('/update/:id', async (req, res) => {

    try {
        const result = await pool.query(
            'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
            [req.body.completed, req.params.id]
        );
        res.json(result.rows[0]); // Aktualisiertes To-Do zurückgeben
    } catch (error) {
        console.error("Fehler beim Aktualisieren:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

app.listen(3050, "0.0.0.0", () => {
    console.log("Server Online")
});
