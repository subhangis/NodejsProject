
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail", // Using Gmail as the SMTP service
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or App password (if using Gmail with 2FA)
    },
});


const sendEmail = async (toEmail, subject, text, html) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: toEmail,
        subject: subject,
        text: text,
        html: html, // Optional: HTML content for the email
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
module.exports = {sendEmail};