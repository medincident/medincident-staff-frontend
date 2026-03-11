import { NextAuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

// Хелпер для запроса нового токена у Zitadel
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
      // Если Zitadel прислал новый refresh_token, используем его, иначе оставляем старый
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      // expires_in приходит в секундах, переводим в миллисекунды для Date.now()
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Ошибка при обновлении токена", error);
    // Возвращаем ошибку, чтобы фронтенд понял, что сессия умерла и выкинул на логин
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    ZitadelProvider({
      issuer: process.env.ZITADEL_ISSUER as string,
      clientId: process.env.ZITADEL_CLIENT_ID as string,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET as string,
      // offline_access КРИТИЧЕСКИ ВАЖЕН, именно он говорит Zitadel выдать нам refresh_token
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
      // 1. ПЕРВЫЙ ЛОГИН (когда account существует)
      if (account) {
        const zitadelProfile = profile as Record<string, any>;
        const rolesObj = zitadelProfile?.["urn:zitadel:iam:user:project:roles"];

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // Сохраняем время, когда токен протухнет
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          scopes: rolesObj ? Object.keys(rolesObj) : ["worker"],
        };
      }

      // 2. ПОСЛЕДУЮЩИЕ ЗАПРОСЫ: Если токен еще живой (с запасом в 1 минуту)
      if (Date.now() < (token.expiresAt as number) - 60 * 1000) {
        return token;
      }

      // 3. ТОКЕН ПРОТУХ: делаем рефреш!
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub as string;
        (session as any).scopes = token.scopes;
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error; // Прокидываем ошибку на клиент, если рефреш сдох

        console.log("🔥 ТОКЕН ДЛЯ ПОСТМАНА:\n", token.accessToken);
      }
      return session;
    },
  },
};
