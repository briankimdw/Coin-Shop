import nodemailer from "nodemailer";
import prisma from "./prisma";

interface SendEmailResult {
  success: boolean;
  error?: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

/**
 * Reads SMTP configuration from the StoreSettings table.
 * Always reads fresh from the database (no caching) so admin changes take effect immediately.
 */
async function getSmtpConfig(): Promise<SmtpConfig | null> {
  let settings;
  try {
    settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPass: true,
        smtpFrom: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to read SMTP settings from database:", message);
    return null;
  }

  if (!settings) {
    return null;
  }

  const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = settings;

  // All five fields are required
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    return null;
  }

  const port = parseInt(smtpPort, 10);
  if (isNaN(port)) {
    return null;
  }

  return {
    host: smtpHost,
    port,
    user: smtpUser,
    pass: smtpPass,
    from: smtpFrom,
  };
}

/**
 * Sends an email using the SMTP settings configured in the admin panel (StoreSettings table).
 * Returns a result object indicating success or a descriptive error message.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const config = await getSmtpConfig();

  if (!config) {
    return {
      success: false,
      error:
        "SMTP is not configured. Go to Settings > Email Configuration and fill in all SMTP fields (host, port, user, password, and from address).",
    };
  }

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to create SMTP transporter:", message);
    return {
      success: false,
      error: `Failed to create email transporter: ${message}`,
    };
  }

  try {
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

    // Provide user-friendly error hints
    if (message.includes("ECONNREFUSED")) {
      return {
        success: false,
        error: `Could not connect to SMTP server at ${config.host}:${config.port}. Check that the host and port are correct.`,
      };
    }
    if (message.includes("ENOTFOUND")) {
      return {
        success: false,
        error: `SMTP host "${config.host}" not found. Check the hostname in your email settings.`,
      };
    }
    if (
      message.includes("Invalid login") ||
      message.includes("authentication") ||
      message.includes("AUTH")
    ) {
      return {
        success: false,
        error:
          "SMTP authentication failed. Check your email username and password.",
      };
    }
    if (message.includes("ETIMEDOUT") || message.includes("timeout")) {
      return {
        success: false,
        error: `Connection to ${config.host}:${config.port} timed out. The server may be unreachable or the port may be wrong.`,
      };
    }

    return { success: false, error: `Email sending failed: ${message}` };
  }
}
