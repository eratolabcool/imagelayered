import type {
  EmailConfigs,
  EmailMessage,
  EmailProvider,
  EmailSendResult,
} from '.';

/**
 * Resend email provider configs
 * @docs https://resend.com/docs/send-with-nextjs
 */
export interface ResendConfigs extends EmailConfigs {
  apiKey: string;
  defaultFrom?: string;
}

/**
 * Resend email provider implementation
 * @website https://resend.com/
 */
export class ResendProvider implements EmailProvider {
  readonly name = 'resend';
  configs: ResendConfigs;

  constructor(configs: ResendConfigs) {
    this.configs = configs;
  }

  async sendEmail(email: EmailMessage): Promise<EmailSendResult> {
    try {
      const resendEmail: Record<string, unknown> = {
        from: email.from || this.configs.defaultFrom || '',
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
      };

      // Add optional fields only if they exist
      if (email.cc) {
        resendEmail.cc = Array.isArray(email.cc) ? email.cc : [email.cc];
      }
      if (email.bcc) {
        resendEmail.bcc = Array.isArray(email.bcc) ? email.bcc : [email.bcc];
      }
      if (email.text) {
        resendEmail.text = email.text;
      }
      if (email.html) {
        resendEmail.html = email.html;
      }
      if (email.replyTo) {
        resendEmail.replyTo = email.replyTo;
      }
      if (email.attachments) {
        resendEmail.attachments = email.attachments.map((att) => ({
          filename: att.filename,
          content:
            typeof att.content === 'string'
              ? att.content
              : att.content.toString('base64'),
          content_type: att.contentType,
        }));
      }
      if (email.tags) {
        resendEmail.tags = email.tags.map((tag) => ({
          name: 'category',
          value: tag,
        }));
      }
      if (email.headers) {
        resendEmail.headers = email.headers;
      }

      // Use Resend's HTTP API directly. The SDK bundles an optional React
      // renderer which pulls Prettier into the Worker even when unused.
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configs.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resendEmail),
      });
      const result = (await response.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        error?: { message?: string };
      };

      if (!response.ok) {
        return {
          success: false,
          error:
            result.message ||
            result.error?.message ||
            `Resend request failed (${response.status})`,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: result.id,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }
}

/**
 * Create Resend provider with configs
 */
export function createResendProvider(configs: ResendConfigs): ResendProvider {
  return new ResendProvider(configs);
}
