import SignInAuth from "@/components/auth/sign-in";

export const metadata = {
  title: "Logg inn - Lukely",
  description: "Logg inn på Lukely for å administrere dine adventskalendere og markedsføringskampanjer.",
};

export default function SignIn() {
  return <SignInAuth />;
}
