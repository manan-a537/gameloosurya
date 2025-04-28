const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'suryadahiya80597@gmail.com',
        pass: 'vipbouedllgdxcqp'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify the connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

// Function to send review notification
const sendReviewNotification = async (reviewData) => {
    const { name, email, review } = reviewData;
    console.log('Preparing to send email notification...');
    
    const mailOptions = {
        from: {
            name: 'Gaming Website',
            address: 'suryadahiya80597@gmail.com'
        },
        to: 'suryadahiya80597@gmail.com',
        subject: 'New Game Review Received',
        html: `
            <h2>New Review Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Review:</strong></p>
            <p>${review}</p>
        `
    };

    try {
        console.log('Attempting to send email with options:', mailOptions);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully. Response:', info);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Detailed email error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        return { 
            success: false, 
            message: `Email sending failed: ${error.message}` 
        };
    }
};

module.exports = { sendReviewNotification }; 