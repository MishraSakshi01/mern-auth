import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
   host: "smtp-relay.brevo.com",
   port: 587,
   auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
   }
});

export default transporter;


//xsmtpsib-ea0008cb0a5e0f2abdbae27cf05964edf20293e6fd8c726bd5124485804bf7bf-m7vVS4DTQwL6IW8b