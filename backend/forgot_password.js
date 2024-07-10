const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
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

router.post('/forgot_password', async (req, res) => {
  const { username, newpassword, confirmpassword } = req.body;

  if (newpassword === confirmpassword) {
    try {
      // Check if username exists
      const userQuery = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);

      if (userQuery.rows.length > 0) {
        // Hash new password
        const hashedPassword = bcrypt.hashSync(newpassword, 10);

        // Update password in the database
        const updateQuery = await pool.query('UPDATE "user" SET password = $1 WHERE username = $2', [hashedPassword, username]);

        res.send(`
          <script>
            alert("Password Reset Successfully");
            window.location.href = "/login_signup";
          </script>
        `);
      } else {
        res.send(`
          <script>
            alert("Username not found. Please try again.");
            window.location.href = "/login_signup";
          </script>
        `);
      }
    } catch (err) {
      console.error(err);
      res.send(`
        <script>
          alert("Error updating password: ${err.message}");
          window.location.href = "/login_signup";
        </script>
      `);
    }
  } else {
    res.send(`
      <script>
        alert("New password and confirm password do not match.");
        window.location.href = "/login_signup";
      </script>
    `);
  }
});

module.exports = router;
