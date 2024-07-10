const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const CryptoJS = require('crypto-js');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'css')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

// Route for handling file upload and encryption/decryption
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.file;
    const action = req.body.action;
    const privateKey = req.body.key;

    if (action === 'encrypt') {
        encryptFile(file.path, privateKey)
            .then((encryptedFilePath) => {
                res.download(encryptedFilePath, `${file.originalname}.encrypted`);
            })
            .catch((err) => {
                console.error('Encryption error:', err);
                res.status(500).send('Encryption failed');
            });
    } else if (action === 'decrypt') {
        decryptFile(file.path, privateKey)
            .then((decryptedFilePath) => {
                res.download(decryptedFilePath, `${file.originalname.replace('.encrypted', '')}`);
            })
            .catch((err) => {
                console.error('Decryption error:', err);
                res.status(500).send('Decryption failed');
            });
    }
});

// AES encryption function
function encryptFile(filePath, privateKey) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) return reject(err);
            const wordArray = CryptoJS.lib.WordArray.create(data);
            const combinedKey = 'marygracedapdap123456789' + privateKey;
            const encryptedContent = CryptoJS.AES.encrypt(wordArray, combinedKey).toString();
            const encryptedFilePath = `${filePath}.encrypted`;
            fs.writeFile(encryptedFilePath, encryptedContent, (err) => {
                if (err) return reject(err);
                resolve(encryptedFilePath);
            });
        });
    });
}

// AES decryption function
function decryptFile(filePath, privateKey) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, encryptedContent) => {
            if (err) return reject(err);
            const combinedKey = 'marygracedapdap123456789' + privateKey;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, combinedKey);
            const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
            const decryptedFilePath = `${filePath.replace('.encrypted', '')}`;
            fs.writeFile(decryptedFilePath, decryptedText, 'utf8', (err) => {
                if (err) return reject(err);
                resolve(decryptedFilePath);
            });
        });
    });
}

// Route for serving home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for about.html
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Route for contact.html
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Route for encrypt_decrypt page
app.get('/encrypt_decrypt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'encrypt_decrypt.html'));
});

app.get('/login_signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/login_signup.html'));
});

// Routes for APIs
const loginRoute = require('./backend/login');
const registerRoute = require('./backend/register');
const forgotPasswordRoute = require('./backend/forgot_password');

app.use('/api', loginRoute);
app.use('/api', registerRoute);
app.use('/api', forgotPasswordRoute);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
