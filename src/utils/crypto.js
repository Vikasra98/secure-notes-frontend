import CryptoJS from "crypto-js";

// Derive a stable AES key from user's email + password using PBKDF2
// The key lives only in sessionStorage – cleared when the browser tab closes
export const deriveKey = (email, password) => {
  return CryptoJS.PBKDF2(email + password, "sn-salt-v1", {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
};

// Encrypt plaintext → AES-256 ciphertext string
export const encryptContent = (plaintext, key) => {
  return CryptoJS.AES.encrypt(plaintext, key).toString();
};

// Decrypt AES-256 ciphertext → plaintext
export const decryptContent = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) throw new Error("empty");
    return plaintext;
  } catch {
    return "[Could not decrypt content]";
  }
};
