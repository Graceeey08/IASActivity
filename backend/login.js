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

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const user = results[0];

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
    });
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
