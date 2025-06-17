import { jwtVerify, SignJWT } from "jose";
import crypto from "node:crypto";

const key = crypto
  .createHash("sha256")
  .update(process.env.KEYKEY_MASTER_SECRET || "dev-secret")
  .digest();

export async function mintDalJwt() {
  return await new SignJWT({ aud: "dal" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("60m")
    .sign(key);
}

export async function verifyDalJwt(token: string) {
  await jwtVerify(token, key, { audience: "dal" });
}