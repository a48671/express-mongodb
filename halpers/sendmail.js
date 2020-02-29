const nodemailer = require('nodemailer');
const { PASS_EMAIL } = require('../keys');

async  function sendMail({email, html, title}) {
    const transporter = nodemailer.createTransport({
        host: "smtp.yandex.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'a48671@yandex.ru',
            pass: PASS_EMAIL
        }
    });

    const result = await transporter.sendMail({
        from: 'a48671@yandex.ru',
        to: email,
        subject: title,
        html: html
    });

    return result;
}

module.exports = sendMail;