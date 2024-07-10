const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const session = require('express-session');
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

// Session configuration
router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: For production, use 'secure: true' with HTTPS
}));

router.post('/register', (req, res) => {
  const { username, password, confirmpassword } = req.body;

  if (password === confirmpassword) {
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
      if (err) {
        res.send(`
          <script>
            alert("Error: ${err.message}");
            window.location.href = "/login_signup";
          </script>
        `);
      } else {
        res.send(`
          <script>
            alert("Registration successful");
            window.location.href = "/login_signup";
          </script>
        `);
      }
    });
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
