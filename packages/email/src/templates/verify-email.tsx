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

interface VerifyEmailProps {
  verifyUrl: string;
  expiresIn?: string;
}

export const VerifyEmail = ({
  verifyUrl,
  expiresIn = "24 hours",
}: VerifyEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify Your Email</Heading>
        <Text style={text}>
          Please verify your email address by clicking the button below. This
          link expires in {expiresIn}.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verifyUrl}>
            Verify Email
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

VerifyEmail.PreviewProps = {
  verifyUrl: "http://localhost:3000/auth/verify?token=abc123",
  expiresIn: "24 hours",
} as VerifyEmailProps;

export default VerifyEmail;

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
