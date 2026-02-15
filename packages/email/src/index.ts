import { render } from "@react-email/components";
import { sendEmail, type SendEmailOptions } from "./mailer";
import WelcomeEmail from "./templates/welcome";
import VerifyEmail from "./templates/verify-email";
import ResetPasswordEmail from "./templates/reset-password";

// =============================================================================
// Email Sending Helpers
// =============================================================================

export async function sendWelcomeEmail(
  to: string,
  name: string,
  appUrl: string
): Promise<void> {
  const html = await render(WelcomeEmail({ name, appUrl }));

  await sendEmail({
    to,
    subject: "Welcome!",
    html,
    text: `Welcome, ${name}! Your account has been created. Visit ${appUrl}/dashboard to get started.`,
  });
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  expiresIn: string = "24 hours"
): Promise<void> {
  const html = await render(VerifyEmail({ verifyUrl, expiresIn }));

  await sendEmail({
    to,
    subject: "Verify Your Email Address",
    html,
    text: `Verify your email by visiting: ${verifyUrl} — This link expires in ${expiresIn}.`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  expiresIn: string = "1 hour"
): Promise<void> {
  const html = await render(ResetPasswordEmail({ resetUrl, expiresIn }));

  await sendEmail({
    to,
    subject: "Reset Your Password",
    html,
    text: `Reset your password by visiting: ${resetUrl} — This link expires in ${expiresIn}.`,
  });
}

// Re-export types and utilities
export { sendEmail, type SendEmailOptions } from "./mailer";
export { WelcomeEmail, VerifyEmail, ResetPasswordEmail };
