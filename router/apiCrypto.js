const crypto = require('crypto');
const pkcs7 = require('pkcs7');
require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY; // 32byte
const ivKey = privateKey.substring(0, 16); // 16byte
const chainingMode = process.env.CHAINING_MODE;

const encrypt = (utf8Text) => {
    const cipher = crypto.createCipheriv(chainingMode, privateKey, ivKey);
    cipher.setAutoPadding(false);
    let encrypted = cipher.update(pkcs7Pad(utf8Text), undefined, "base64");
    encrypted += cipher.final("base64");
    return encrypted;
};

const decrypt = (base64Text) => {
    const decipher = crypto.createDecipheriv(chainingMode, privateKey, ivKey);
    decipher.setAutoPadding(false);
    let decrypted = decipher.update(base64Text, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return pkcs7Unpad(decrypted);
};

const pkcs7Pad = (params) => {
    const buffer = Buffer.from(params, "utf8");
    const bytes = new Uint8Array(buffer.length);
    let i = buffer.length;
    while (i--) {
        bytes[i] = buffer[i];
    }
    return Buffer.from(pkcs7.pad(bytes));
}

const pkcs7Unpad = (params) => {
    const buffer = Buffer.from(params, "utf8");
    const bytes = new Uint8Array(buffer.length);
    let i = buffer.length;
    while (i--) {
        bytes[i] = buffer[i];
    }
    const result = Buffer.from(pkcs7.unpad(bytes));
    return result.toString("utf8");
}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;