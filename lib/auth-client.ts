import { createAuthClient } from "better-auth/client";
import { lastLoginMethodClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [lastLoginMethodClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
export const {
  getLastUsedLoginMethod,
  isLastUsedLoginMethod,
  clearLastUsedLoginMethod,
} = authClient;
