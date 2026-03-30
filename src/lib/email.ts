import nodemailer from "nodemailer";
import prisma from "./prisma";

interface SendEmailResult {
  success: boolean;
  error?: string;
}

interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  // Try DB first (owner-configured SMTP)
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPass: true,
        smtpFrom: true,
      },
    });

    if (
      settings?.smtpHost &&
      settings?.smtpPort &&
      settings?.smtpUser &&
      settings?.smtpPass &&
      settings?.smtpFrom
    ) {
      return {
        host: settings.smtpHost,
        port: settings.smtpPort,
        user: settings.smtpUser,
        pass: settings.smtpPass,
        from: settings.smtpFrom,
      };
    }
  } catch {
    // DB not available, fall through to env
  }

  // Fall back to environment variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (host && port && user && pass && from) {
    return { host, port, user, pass, from };
  }

  return null;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const config = await getSmtpConfig();

  if (!config) {
    return { success: false, error: "SMTP not configured. Set up email in Settings > Email Configuration." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port, 10),
      secure: parseInt(config.port, 10) === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("Email send error:", message);
    return { success: false, error: message };
  }
}
