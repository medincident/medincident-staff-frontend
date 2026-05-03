import { getSession } from "@/lib/auth/session";
import { Scope, SCOPES } from "@/lib/auth/scopes";

interface RoleGateProps {
  children: React.ReactNode;
  allowedScopes: Scope[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export async function RoleGate({ 
  children, 
  allowedScopes, 
  requireAll = false,
  fallback = null 
}: RoleGateProps) {
  const session = await getSession();

  if (!session || !session.scopes) {
    return <>{fallback}</>;
  }

  if (session.scopes.includes(SCOPES.SYSTEM_ADMIN)) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? allowedScopes.every(scope => session.scopes.includes(scope))
    : allowedScopes.some(scope => session.scopes.includes(scope));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}