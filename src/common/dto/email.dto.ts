import { EmailTemplate } from '../mailer/node.mailer';

export class EmailDto {
  to: string;
  subject: string;
  template: EmailTemplate;
  payload: {};
}
