"use client";

import { SessionProvider } from "next-auth/react";

// Без рефетча по фокусу и интервалу: каждый рефетч триггерил useEffect-зависимости
// в админке (orgId, scopes) и запускал по 5–7 параллельных /admins?limit=200 и т. п.
// Токен обновляется по 401 в ApiProvider, callback `jwt` в auth-options сам ходит
// в Zitadel за refresh.
export function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
            {children}
        </SessionProvider>
    );
}