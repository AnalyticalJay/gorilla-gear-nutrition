import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const registerSource = readFileSync(resolve(process.cwd(), "client/src/pages/Register.tsx"), "utf8");
const formSource = readFileSync(resolve(process.cwd(), "client/src/components/RegistrationForm.tsx"), "utf8");

describe("branded membership application page", () => {
  it("uses the Gorilla Gear white, charcoal, and gold system instead of legacy blue-red styling", () => {
    expect(registerSource).toContain("bg-[#f6f4ef]");
    expect(registerSource).toContain("text-[#c99a3d]");
    expect(registerSource).not.toContain("#0EA5E9");
    expect(registerSource).not.toContain("#E11D48");
    expect(formSource).toContain("bg-[#c99a3d]");
    expect(formSource).not.toContain("#0EA5E9");
  });
});
