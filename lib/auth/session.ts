import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { Scope } from "./scopes";

export interface JWTPayload {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  scopes: Scope[];
  accessToken?: string;
}

export async function getSession(): Promise<JWTPayload | null> {
  const session = await getServerSession(authOptions);
  return session as JWTPayload | null;
}