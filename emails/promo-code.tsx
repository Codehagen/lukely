import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PromoCodeEmailProps {
  calendarTitle: string;
  promoCode: string;
  promoCodeMessage?: string | null;
  calendarUrl: string;
  logo?: string | null;
  brandColor?: string | null;
  workspaceName?: string | null;
}

export function PromoCodeEmail({
  calendarTitle,
  promoCode,
  promoCodeMessage,
  calendarUrl,
  logo,
  brandColor,
  workspaceName,
}: PromoCodeEmailProps) {
  const previewText = `Din rabattkode fra ${calendarTitle}: ${promoCode}`;
  const buttonColor = brandColor || "#18181b";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {logo && (
            <Section style={logoSection}>
              <Img src={logo} alt={calendarTitle} style={logoStyle} />
            </Section>
          )}
          <Heading style={heading}>Takk for din deltakelse!</Heading>
          <Section style={section}>
            <Text style={text}>
              Du har nå registrert deg i <strong>{calendarTitle}</strong>
              {workspaceName && ` fra ${workspaceName}`}. Som takk for din
              deltakelse har du fått en rabattkode:
            </Text>

            <Section style={promoCodeSection}>
              <Text style={promoCodeLabel}>Din rabattkode:</Text>
              <Text style={{ ...promoCodeValue, borderColor: buttonColor }}>
                {promoCode}
              </Text>
              {promoCodeMessage && (
                <Text style={promoCodeDescription}>{promoCodeMessage}</Text>
              )}
            </Section>

            <Text style={text}>
              Husk å ta vare på denne koden! Du kan bruke den ved neste kjøp.
            </Text>

            <Link href={calendarUrl} style={{ ...button, backgroundColor: buttonColor }}>
              Besøk kalenderen
            </Link>
          </Section>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} {workspaceName || "Lukely"}. Alle
            rettigheter reservert.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PromoCodeEmail;

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

const logoSection = {
  textAlign: "center" as const,
  padding: "24px 0 0",
};

const logoStyle = {
  maxWidth: "120px",
  maxHeight: "60px",
  margin: "0 auto",
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

const promoCodeSection = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fcd34d",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const promoCodeLabel = {
  margin: "0 0 8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#92400e",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const promoCodeValue = {
  margin: "0 0 12px",
  fontSize: "32px",
  fontWeight: "700",
  color: "#78350f",
  letterSpacing: "4px",
  fontFamily: "monospace",
  padding: "12px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  border: "2px dashed #fcd34d",
  display: "inline-block",
};

const promoCodeDescription = {
  margin: "12px 0 0",
  fontSize: "14px",
  color: "#92400e",
};

const button = {
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

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "32px",
};
