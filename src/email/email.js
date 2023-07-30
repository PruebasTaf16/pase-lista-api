import nodemailer from "nodemailer";

/**
 * El transporter es el medio con el que se mandarán los correos
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'test.taf16@gmail.com',
        pass: 'yvcykovygjycojdr',
    }
});

/**
 * Método que envía el emial
 * @param to correo de la persona a enviar
 * @param subject Sujeto del correo
 * @param text Contenido
 * @returns Promesa validando que se ha enviado el email
 */
export const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'test.taf16@gmail.com',
        to,
        subject,
        text,
    }
    
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                resolve('Email enviado.' + info.response);
            }
        });
    });
}