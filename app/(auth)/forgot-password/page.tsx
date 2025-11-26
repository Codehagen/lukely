import ForgotPasswordAuth from "@/components/auth/forgot-password";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glemt passord - Lukely",
  description: "Tilbakestill passordet ditt på Lukely",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordAuth />;
}
