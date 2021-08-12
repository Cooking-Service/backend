import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { EmailDto } from '../dto/email.dto';

export enum EmailTemplate {
  TEST = 'test',
  ACTIVE_ACCOUNT = 'active-account',
}

export const sendEmail = async (data: EmailDto) => {
  const from = process.env.FROM_EMAIL;
  const pass = process.env.PASS_EMAIL;

  const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: from,
      pass: pass,
    },
  });

  let templateFile: string;

  switch (data.template) {
    case EmailTemplate.TEST:
      templateFile = 'test.hbs';
      break;
    case EmailTemplate.ACTIVE_ACCOUNT:
      templateFile = 'active-account.hbs';
      break;
  }

  const templateSource = fs.readFileSync(
    path.join(__dirname, `/templates/${templateFile}`),
    'utf-8',
  );

  const template = Handlebars.compile(templateSource);

  const mailOptions = {
    from: from,
    to: data.to,
    subject: data.subject,
    html: template(data.payload),
  };

  return await transporter
    .sendMail(mailOptions)
    .then((res) => {
      return {
        success: true,
        response: res,
      };
    })
    .catch((err) => {
      return {
        success: false,
        error: err,
      };
    });
};
