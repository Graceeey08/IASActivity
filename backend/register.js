const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const session = require('express-session');
const path = require('path');

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  host: process.env.PG_HOST || 'dpg-cq6uvq6ehbks73979070-a',
  user: process.env.PG_USER || 'iaswebactivity_user',
  password: process.env.PG_PASSWORD || 'c1o0pK4As2yP6yWHZIf0ma1n0mUjU8Rs',
  database: process.env.PG_DATABASE || 'iaswebactivity',
  port: process.env.PG_PORT || 5432
});

// Session configuration
router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: For production, use 'secure: true' with HTTPS
}));

router.post('/register', async (req, res) => {
  const { username, password, confirmpassword } = req.body;

  if (password === confirmpassword) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, hashedPassword]);

      res.send(`
        <script>
          alert("Registration successful");
          window.location.href = "/login_signup";
        </script>
      `);
    } catch (err) {
      console.error(err);
      res.send(`
        <script>
          alert("Error: ${err.message}");
          window.location.href = "/login_signup";
        </script>
      `);
    }
  } else {
    res.send(`
      <script>
        alert("Passwords do not match");
        window.location.href = "/login_signup";
      </script>
    `);
  }
});

module.exports = router;
