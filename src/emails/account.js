const sgMail = require("@sendgrid/mail")

 
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
const sendWelcomeEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: "napselc.abhi@gmail.com",
        subject: "Welcome",
        text: `Thanks for joining ${name}`
    })
}


const sendExitEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: "napselc.abhi@gmail.com",
        subject: "Sorry",
        text: `Hope we could do something for you, ${name}`
    })
}

module.exports = {sendWelcomeEmail, sendExitEmail}