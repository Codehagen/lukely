import { createAuthClient } from "better-auth/client";
import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [lastLoginMethodClient(), adminClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
export const {
  getLastUsedLoginMethod,
  isLastUsedLoginMethod,
  clearLastUsedLoginMethod,
} = authClient;

// Admin functions
export const {
  impersonateUser,
  stopImpersonating,
  listUsers,
  setRole,
  banUser,
  unbanUser,
  createUser,
  removeUser,
} = authClient.admin;
