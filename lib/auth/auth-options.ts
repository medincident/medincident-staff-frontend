import { NextAuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

export const authOptions: NextAuthOptions = {
    providers: [
        ZitadelProvider({
            issuer: process.env.ZITADEL_ISSUER as string,
            clientId: process.env.ZITADEL_CLIENT_ID as string,
            clientSecret: process.env.ZITADEL_CLIENT_SECRET as string,
            // Запрашиваем нужные скоупы у Zitadel
            authorization: { params: { scope: "openid profile offline_access" } },
        }),
    ],
    callbacks: {
        // 1. JWT коллбек вызывается при логине и рефреше
        async jwt({ token, account, profile }) {
            // Если юзер только что залогинился, сохраняем access_token и данные
            if (account) {
                token.accessToken = account.access_token;
                // В Zitadel роли обычно приходят в profile. Вытаскиваем их (замени на свой формат, если нужно)
                token.scopes = profile?.['urn:zitadel:iam:user:project:roles']
                    ? Object.keys(profile['urn:zitadel:iam:user:project:roles'])
                    : ["worker", "requests:read:own"]; // Фолбэк для теста
            }
            return token;
        },
        // 2. Session коллбек передает данные на клиент и в серверные компоненты
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub as string;
                (session as any).scopes = token.scopes; // Прокидываем права для RoleGate
                (session as any).accessToken = token.accessToken; // Для запросов к API
            }
            return session;
        }
    },
    // Кастомные страницы (если не указывать, next-auth сгенерирует дефолтную)
    // pages: {
    //   signIn: '/login', 
    // }
};