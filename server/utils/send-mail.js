const nodemailer = require('nodemailer')

const sendMail = (email, uniqueString) => {
    var Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD 
        }
    })

    var mailOptions
    let sender = "Raghunath Prabhakar"
    mailOptions = {
        from: sender,
        to: email,
        subject: "Email confirmation",
        html: `Press <a href=${process.env.FRONTEND_ENDPOINT}/auth/verify/}>here</a> to verify your email, Thanks!`
    }

    Transport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log('Nodemailer:\n',error)
        } else {
            console.log("Nodemailer: Message Sent")
        }
    })

}

module.exports = sendMail