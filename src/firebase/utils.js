import CryptoJS from "crypto-js";
<<<<<<< HEAD

const SECRET = import.meta.env.VITE_ENCRYPTION_KEY;

export const encrypt = (text) =>
  CryptoJS.AES.encrypt(text, SECRET).toString();

export const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
=======
const SECRET = import.meta.env.VITE_ENCRYPTION_KEY;
export const encrypt = (text) =>
  CryptoJS.AES.encrypt(text, SECRET).toString();
export const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
>>>>>>> 8a69c21691b430a00b290d267a1313fc6b4343e2
