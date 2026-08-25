import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

describe("session cookie security", () => {
  it("uses an httpOnly, secure, same-site policy on HTTPS requests", () => {
    const options = getSessionCookieOptions({ protocol: "https", headers: {} } as any);
    expect(options).toMatchObject({ httpOnly: true, path: "/", sameSite: "lax", secure: true });
  });

  it("recognises HTTPS when the trusted proxy forwards the protocol", () => {
    const options = getSessionCookieOptions({ protocol: "http", headers: { "x-forwarded-proto": "https" } } as any);
    expect(options.secure).toBe(true);
  });
});
