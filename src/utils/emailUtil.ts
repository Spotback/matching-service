import nodemailer from 'nodemailer';
import SUBSTITUTOR from './substitutor';
import Mail from 'nodemailer/lib/mailer';

class EmailUtil {
  
  private transporter: Mail;

  constructor() {
    const username = process.env.GMAIL_USERNAME;
    const password = process.env.GMAIL_PASSWORD;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'LOGIN',
        user: username as any,
        pass: password as any
      }
    });
  }

  public send(message: string, subject: string, data: any, callback: Function): void {
    //map the data into the message
    const mappedMessage = SUBSTITUTOR(message, data);
    //set the text to the message
    const mailOptions: Mail.Options = {
      html: mappedMessage,
      to: data.email,
      subject: subject
    }
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        callback(error, null);
      } else {
        console.debug('Email sent: ' + info.response);
        callback(null, info);
      }
    });
  }
}

export default new EmailUtil();