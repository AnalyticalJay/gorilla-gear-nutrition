import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";

describe("email/password session tokens", () => {
  it("keeps numeric user sessions verifiable when no explicit name is supplied", async () => {
    const token = await sdk.createSessionToken("12345");
    const session = await sdk.verifySession(token);

    expect(session).toMatchObject({ openId: "12345", name: "12345" });
  });

  it("preserves an explicit display name when one is supplied", async () => {
    const token = await sdk.createSessionToken("12345", { name: "Approved Member" });
    const session = await sdk.verifySession(token);

    expect(session).toMatchObject({ openId: "12345", name: "Approved Member" });
  });
});
