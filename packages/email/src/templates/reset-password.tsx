import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  resetUrl: string;
  expiresIn?: string;
}

export const ResetPasswordEmail = ({
  resetUrl,
  expiresIn = "1 hour",
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>
          We received a request to reset your password. Click the button below
          to create a new password. This link expires in {expiresIn}.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={resetUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

ResetPasswordEmail.PreviewProps = {
  resetUrl: "http://localhost:3000/auth/reset-password?token=abc123",
  expiresIn: "1 hour",
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;

// =============================================================================
// Styles
// =============================================================================

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "700",
  margin: "40px 0",
  padding: "0 48px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
  padding: "0 48px",
};

const buttonContainer = {
  padding: "0 48px",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  marginTop: "16px",
};

const footer = {
  color: "#9a9a9a",
  fontSize: "14px",
  margin: "24px 0 0",
  padding: "0 48px",
};
