import { PrismaClient } from "@/app/generated/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, lastLoginMethod } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
  session: {
    additionalFields: {
      impersonatedBy: {
        type: "string",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    lastLoginMethod(),
    admin({
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
      roles: {
        ADMIN: adminAc,
        USER: userAc,
      },
      impersonationSessionDuration: 3600, // 1 hour
    }),
  ],
});
