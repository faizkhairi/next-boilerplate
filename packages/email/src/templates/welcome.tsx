import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export const WelcomeEmail = ({ name, appUrl }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>🚀 App Logo</Text>
        </Section>

        <Heading style={h1}>Welcome, {name}!</Heading>

        <Text style={text}>
          Your account has been created successfully. We're excited to have you on board!
        </Text>

        <Text style={text}>
          You can now sign in and start exploring all the features we have to offer.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}/dashboard`}>
            Go to Dashboard
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          If you didn't create this account, you can safely ignore this email.
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

WelcomeEmail.PreviewProps = {
  name: "John Doe",
  appUrl: "http://localhost:3000",
} as WelcomeEmailProps;

export default WelcomeEmail;

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
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const header = {
  padding: "20px 48px",
  borderBottom: "1px solid #eaeaea",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
  color: "#0f172a",
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
  padding: "12px 32px",
  marginTop: "16px",
};

const hr = {
  borderColor: "#eaeaea",
  margin: "32px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "1.5",
  textAlign: "center" as const,
  padding: "0 48px",
  margin: "8px 0",
};
