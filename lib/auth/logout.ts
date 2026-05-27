import { signOut } from "next-auth/react";
import { clearMyEmployeeCache } from "./get-my-employee";

// keepSession=true — soft logout (только NextAuth-куки, Zitadel SSO остаётся).
// keepSession=false — full logout через end_session_endpoint.
// Для full logout в Zitadel Post Logout URI должен включать `${origin}/login`.

export interface LogoutOptions {
  keepSession: boolean;
  idToken?: string | null;
}

export async function logout({
  keepSession,
  idToken,
}: LogoutOptions): Promise<void> {
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

  const url = new URL(`${issuer}/oidc/v1/end_session`);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set(
    "post_logout_redirect_uri",
    `${window.location.origin}/login`,
  );
  window.location.href = url.toString();
}
