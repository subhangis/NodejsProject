const bcrypt = require('bcrypt');


// Select salt rounds (the higher the number, the more secure, but slower)
const SALT_ROUNDS = 10;

// Encrypt Function (with salt)
async function encryptPassword(password) {
    try {
        // Generate a salt with the specified number of rounds
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error("Error encrypting password:", error);
    }
}

// Decrypt Function (Compare password)
async function decryptPassword(plainPassword, hashedPassword) {
    try {
        // Compare the plain password with the stored hashed password
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("Error comparing password:", error);
    }
}
module.exports = {encryptPassword,decryptPassword}