const express = require("express");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const path = require("path");

const publicKey = fs.readFileSync(path.join(__dirname, "publicKey.pem"), "utf8");
const privateKey = fs.readFileSync(path.join(__dirname, "private.pem"), "utf8");

// --- Encrypt endpoint ---
app.post("/encrypt", (req, res) => {
  const { text } = req.body;

  // Generate AES key & IV
  const aesKey = crypto.randomBytes(32); // 256-bit
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Encrypt AES key with RSA
  const encryptedKey = crypto.publicEncrypt(publicKey, aesKey).toString("base64");
  const ivString = iv.toString("base64");

  res.json({ encrypted, encryptedKey, iv: ivString });
});

// --- Decrypt endpoint ---
app.post("/decrypt", (req, res) => {
  const { encrypted, encryptedKey, iv } = req.body;

  try {
    const aesKey = crypto.privateDecrypt(privateKey, Buffer.from(encryptedKey, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, Buffer.from(iv, "base64"));
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    res.json({ decrypted });
  } catch (err) {
    console.error("Decryption error:", err.message);
    res.status(400).json({ error: "Failed to decrypt" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Encryption server running at http://localhost:${PORT}`);
});
