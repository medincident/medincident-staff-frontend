import { NextAuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ZITADEL_ISSUER}/oauth/v2/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.ZITADEL_CLIENT_ID as string,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      },
    );

    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Ошибка при обновлении токена", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    ZitadelProvider({
      issuer: process.env.NEXT_PUBLIC_ZITADEL_ISSUER as string,
      clientId: process.env.ZITADEL_CLIENT_ID as string,
      // Public-client + PKCE: secret в Zitadel выключен (Auth Method: None).
      // NextAuth тип требует строку, а token_endpoint_auth_method=none
      // отключает её передачу при обмене кода.
      clientSecret: "",
      client: { token_endpoint_auth_method: "none" },
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
        const p = profile as Record<string, any> | undefined;

        // name/email/picture в id_token приходят только при включённом
        // "Include user's profile info in the ID Token". Чтобы не зависеть
        // от настроек проекта Zitadel, тянем userinfo руками.
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 10_000);
        let info: Record<string, any> = {};
        try {
          const r = await fetch(
            `${process.env.NEXT_PUBLIC_ZITADEL_ISSUER}/oidc/v1/userinfo`,
            {
              headers: { Authorization: `Bearer ${account.access_token}` },
              signal: ac.signal,
            },
          );
          if (r.ok) info = await r.json();
        } catch (e) {
          console.warn("[auth] userinfo fetch failed", e);
        } finally {
          clearTimeout(timer);
        }

        // Claim `name` у админских аккаунтов часто остаётся служебным
        // ("ZITADEL Admin"), поэтому при наличии given/family собираем сами.
        const givenName = info.given_name ?? p?.given_name;
        const familyName = info.family_name ?? p?.family_name;
        const composed = [givenName, familyName].filter(Boolean).join(" ");
        const name =
          composed ||
          info.name ||
          p?.name ||
          info.preferred_username ||
          p?.preferred_username ||
          info.email ||
          p?.email;

        return {
          ...token,
          name,
          email: info.email ?? p?.email,
          picture: info.picture ?? p?.picture,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
        };
      }

      if (Date.now() < (token.expiresAt as number) - 60 * 1000) return token;
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub as string;
        // Шлём оба токена: бэк валидирует id_token (JWT), а access_token
        // в Zitadel может прийти opaque. Доменные роли больше не лежат
        // в session — фронт спрашивает их у бэка через SelfQueryService.
        (session as any).idToken = token.idToken;
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error;
      }
      return session;
    },
  },
};
