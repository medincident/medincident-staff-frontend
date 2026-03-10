import { NextAuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

export const authOptions: NextAuthOptions = {
    providers: [
        ZitadelProvider({
            issuer: process.env.ZITADEL_ISSUER as string,
            clientId: process.env.ZITADEL_CLIENT_ID as string,
            clientSecret: process.env.ZITADEL_CLIENT_SECRET as string,
            authorization: { params: { scope: "openid email profile offline_access urn:zitadel:iam:user:project:roles" } }, // Добавил скоуп ролей Zitadel
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;

                // Приводим profile к типу, который разрешает любые ключи-строки
                const zitadelProfile = profile as Record<string, any>;
                const rolesObj = zitadelProfile?.['urn:zitadel:iam:user:project:roles'];

                token.scopes = rolesObj
                    ? Object.keys(rolesObj)
                    : ["worker", "requests:read:own"]; // Фолбэк на случай, если ролей нет
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Приводим к any, чтобы легко прокинуть кастомные поля на фронт
                (session.user as any).id = token.sub as string;
                (session as any).scopes = token.scopes;
                (session as any).accessToken = token.accessToken;
            }
            return session;
        }
    }
};