import bcrypt from "bcrypt";
import { prisma } from "./db";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@repo/email";
import crypto from "crypto";

const SALT_ROUNDS = 10;

// =============================================================================
// User Registration
// =============================================================================

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      emailVerified: null, // Will be set after verification
    },
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // 24 hour expiry

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires,
    },
  });

  // Send verification email
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(user.email)}`;

  await sendVerificationEmail(user.email, verifyUrl);

  return { id: user.id, email: user.email, name: user.name };
}

// =============================================================================
// Email Verification
// =============================================================================

export async function verifyEmail(email: string, token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  if (!verificationToken) {
    throw new Error("Invalid or expired verification token");
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });
    throw new Error("Verification token expired");
  }

  // Update user
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  // Send welcome email
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    await sendWelcomeEmail(user.email, user.name || "there", appUrl);
  }

  return true;
}

// =============================================================================
// Password Reset
// =============================================================================

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal if user exists
    return true;
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour expiry

  await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token,
      expires,
    },
  });

  // Send reset email
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendPasswordResetEmail(email, resetUrl);

  return true;
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: `password-reset:${email}`,
        token,
      },
    },
  });

  if (!verificationToken) {
    throw new Error("Invalid or expired reset token");
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `password-reset:${email}`,
          token,
        },
      },
    });
    throw new Error("Reset token expired");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update user password
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: `password-reset:${email}`,
        token,
      },
    },
  });

  return true;
}
