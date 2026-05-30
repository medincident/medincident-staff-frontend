import { signOut } from "next-auth/react";
import { clearMyEmployeeCache } from "./get-my-employee";

// keepSession=true — soft logout (только NextAuth-куки, Zitadel SSO остаётся).
// keepSession=false — full logout через end_session_endpoint.
// Для full logout в Zitadel Post Logout URI должен включать `${origin}/login`.
//
// В end_session передаём client_id, а не id_token_hint: id_token живёт ~1ч и
// не возвращается на refresh, после первого refresh-цикла он протухает и
// Zitadel отклоняет logout-запрос. client_id у public-клиента — публичен.

export interface LogoutOptions {
  keepSession: boolean;
}

export async function logout({ keepSession }: LogoutOptions): Promise<void> {
  clearMyEmployeeCache();
  await signOut({ redirect: false });

  const issuer = process.env.NEXT_PUBLIC_ZITADEL_ISSUER;
  if (!issuer) {
    window.location.href = "/login";
    return;
  }

  if (keepSession) {
    window.location.href = `${issuer}/profile/details`;
    return;
  }

  const clientId = process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID;
  const url = new URL(`${issuer}/oidc/v1/end_session`);
  if (clientId) url.searchParams.set("client_id", clientId);
  url.searchParams.set(
    "post_logout_redirect_uri",
    `${window.location.origin}/login`,
  );
  window.location.href = url.toString();
}
