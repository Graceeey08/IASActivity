const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { Pool } = require('pg');

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

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    try {
      const result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];

        if (bcrypt.compareSync(password, user.password)) {
          req.session.userId = user.id;
          req.session.username = username;
          res.send(`
            <script>
              alert("Welcome! ${user.username}");
              window.location.href = "/encrypt_decrypt";
            </script>
          `);
        } else {
          res.send(`
            <script>
              alert("Invalid username or password");
              window.location.href = "/login_signup";
            </script>
          `);
        }
      } else {
        res.send(`
          <script>
            alert("Invalid username or password");
            window.location.href = "/login_signup";
          </script>
        `);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred');
    }
  } else {
    res.send(`
      <script>
        alert("Please enter username and password");
        window.location.href = "/login_signup";
      </script>
    `);
  }
});

module.exports = router;
