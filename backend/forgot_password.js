const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');

const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'iaswebactivity'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

router.post('/forgot_password', (req, res) => {
  const { username, newpassword, confirmpassword } = req.body;

  if (newpassword === confirmpassword) {
    db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const hashedPassword = bcrypt.hashSync(newpassword, 10);

        db.query('UPDATE user SET password = ? WHERE username = ?', [hashedPassword, username], (err, results) => {
          if (err) {
            res.send(`
              <script>
                alert("Error updating password: ${err.message}");
                window.location.href = "/login_signup";
              </script>
            `);
          } else {
            res.send(`
              <script>
                alert("Password Reset Successfully");
                window.location.href = "/login_signup";
              </script>
            `);
          }
        });
      } else {
        res.send(`
          <script>
            alert("Username not found. Please try again.");
            window.location.href = "/login_signup";
          </script>
        `);
      }
    });
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
