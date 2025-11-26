import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  url: string;
  userName?: string | null;
}

export function PasswordResetEmail({ url, userName }: PasswordResetEmailProps) {
  const previewText = "Tilbakestill passordet ditt på Lukely";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Lukely</Heading>
          <Section style={section}>
            <Text style={text}>
              Hei{userName ? ` ${userName}` : ""},
            </Text>
            <Text style={text}>
              Vi mottok en forespørsel om å tilbakestille passordet ditt. Klikk
              på knappen nedenfor for å opprette et nytt passord:
            </Text>
            <Button style={button} href={url}>
              Tilbakestill passord
            </Button>
            <Text style={text}>
              Hvis du ikke ba om å tilbakestille passordet, kan du trygt
              ignorere denne e-posten. Passordet ditt vil forbli uendret.
            </Text>
            <Text style={smallText}>
              Lenken utløper om 1 time. Hvis du har problemer med knappen, kan
              du kopiere og lime inn følgende URL i nettleseren din:
            </Text>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Section>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Lukely. Alle rettigheter
            reservert.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordResetEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#18181b",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const section = {
  padding: "24px",
};

const text = {
  margin: "0 0 16px",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#3c4149",
};

const smallText = {
  margin: "24px 0 8px",
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#666",
};

const button = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "24px 0",
};

const link = {
  color: "#2563eb",
  fontSize: "13px",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "32px",
};
