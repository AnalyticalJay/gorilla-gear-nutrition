import crypto from "crypto";

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  isSandbox?: boolean;
}

export function getPayFastConfig(): PayFastConfig {
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    isSandbox: false,
  };
}

export function generatePayFastSignature(data: Record<string, string | number>, passphrase?: string): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort();
  let pfOutput = "";

  for (const key of sortedKeys) {
    const val = data[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      pfOutput += `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, "+")}&`;
    }
  }

  // Remove trailing ampersand
  pfOutput = pfOutput.slice(0, -1);

  if (passphrase && passphrase.trim() !== "") {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
}

export function verifyPayFastItnSignature(data: Record<string, string | undefined>, receivedSignature: string, passphrase?: string): boolean {
  const payloadWithoutSig = { ...data };
  delete payloadWithoutSig.signature;
  const calculated = generatePayFastSignature(payloadWithoutSig as Record<string, string | number>, passphrase);
  return calculated.toLowerCase() === receivedSignature.toLowerCase();
}
