import { base64UrlEncode } from "./encoding-utils";

export type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

export async function getAccessToken(
  creds: ServiceAccountCredentials
): Promise<string> {
  const jwtHeader = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(jwtHeader));
  const encodedClaim = base64UrlEncode(JSON.stringify(jwtClaim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signature = await signJWT(signatureInput, creds.private_key);
  return `${signatureInput}.${signature}`;
}

async function signJWT(data: string, privateKey: string): Promise<string> {
  try {
    const normalizedKey = privateKey.replace(/\\n/g, "\n");

    const pemContents = normalizedKey
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\n/g, "")
      .replace(/\r/g, "")
      .replace(/\s/g, "");

    // Validar que solo contenga caracteres base64 válidos
    if (!/^[A-Za-z0-9+/=]+$/.test(pemContents)) {
      throw new Error("Private key contains invalid characters after cleaning");
    }

    const binaryDer = Uint8Array.from(atob(pemContents), (c) =>
      c.charCodeAt(0)
    );

    const key = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(data)
    );

    return base64UrlEncode(signature);
  } catch (error) {
    throw new Error(`Failed to sign JWT: ${error}`);
  }
}
