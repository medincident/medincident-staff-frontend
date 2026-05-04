import { NextAuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.ZITADEL_ISSUER}/oauth/v2/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.ZITADEL_CLIENT_ID as string,
          client_secret: process.env.ZITADEL_CLIENT_SECRET as string,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      },
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Ошибка при обновлении токена", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    ZitadelProvider({
      issuer: process.env.ZITADEL_ISSUER as string,
      clientId: process.env.ZITADEL_CLIENT_ID as string,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope:
            "openid email profile offline_access urn:zitadel:iam:user:project:roles",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        const zitadelProfile = profile as Record<string, any>;
        const rolesObj = zitadelProfile?.["urn:zitadel:iam:user:project:roles"];

        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          scopes: rolesObj ? Object.keys(rolesObj) : ["worker"],
        };
      }

      if (Date.now() < (token.expiresAt as number) - 60 * 1000) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub as string;
        (session as any).scopes = token.scopes;
        (session as any).accessToken = token.accessToken;
        (session as any).idToken = token.idToken;
        (session as any).jwtToken = token.accessToken ?? token.idToken;
        (session as any).error = token.error;
      }
      return session;
    },
  },
};
