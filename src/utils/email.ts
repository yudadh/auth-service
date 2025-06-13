import nodemailer from 'nodemailer'
import { env } from '../config/envConfig'
import { logger } from './logger'
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: env.GMAIL_USERNAME,
        pass: env.GMAIL_PASSWORD
    }
})

// const transporter = nodemailer.createTransport({
//    host: "sandbox.smtp.mailtrap.io",
//    port: 2525,
//    auth: {
//      user: "891d0b03f669ec",
//      pass: "4ba24053cc06e1"
//    }
//  });

export async function sendEmail(email: string, name: string, subject: string, url: string) {
   console.log(email)
   const __dirname = path.resolve();
   const filePath = path.join(__dirname, './src/templates/resetPasswordEmail.html');
   const source = fs.readFileSync(filePath, 'utf-8').toString();
   const template = handlebars.compile(source);
   const replacements = {
     name: name,
     action_url: url
   };
   const htmlToSend = template(replacements);
   // const subject = 'Set Password Akun Anda'
   try {
      const message = await transporter.sendMail({
         from: env.GMAIL_USERNAME,
         to: email,
         subject: subject,
         html: htmlToSend
      })
      logger.info(`Email has been sent: ${message.messageId}`)
      return true
   } catch (error) {
      logger.error(`Failed to send email %s`, error)
      return false
   }
}

