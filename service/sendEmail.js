const nodemailer = require('nodemailer');
require('dotenv').config();


async function emailSend(email , subject , textMessage , htmlMessage){
    try {
       
        if (!email) {
            return res.status(400).json({ status: false, message: 'Please provide valid recipient email addresses' }); 
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        const mailOptions = {
            from: `"${process.env.SENDER_NAME} 👻" <debashish@atthah.com>`,  // Sender address
            to: recipients.join(','), // Bulk recipients
            subject: `${subject}`,
            text: `${textMessage}`,
            html: `${htmlMessage}`
        };
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        res.status(200).json({
            status:true,
            details:info,
            message:"Mail sent successfully",
            messageId:info.messageId})
        } catch (error) {
            console.log(error);
            res.status(400).json({
                status:false,
                message:"Failed to send mail",
                error:error})
            }
            
        }
/* This is the gmail server End*/

module.exports = {
    emailSend
}