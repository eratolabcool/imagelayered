import { respData, respErr } from '@/shared/lib/resp';
import { getEmailService } from '@/shared/services/email';

export async function POST(req: Request) {
  try {
    const { emails, subject } = await req.json();

    const emailService = await getEmailService();

    const result = await emailService.sendEmail({
      to: emails,
      subject: subject,
      html: `<div><h1>Verification Code</h1><p>Your verification code is: 123455</p></div>`,
    });

    console.log('send email result', result);

    return respData(result);
  } catch (e) {
    console.log('send email failed:', e);
    return respErr('send email failed');
  }
}
