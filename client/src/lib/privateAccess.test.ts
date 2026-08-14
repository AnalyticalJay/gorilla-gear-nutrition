import { describe, expect, it } from "vitest";

import { countApplicants, filterApplicants, getApplicantInitials, type ApplicantSummary } from "./privateAccess";
import { registrationSchema, toRegistrationPayload } from "./registrationValidation";

const applicants: ApplicantSummary[] = [
  {
    id: 1,
    fullName: "Aisha Daniels",
    email: "aisha@example.com",
    phone: "+27 82 111 1111",
    city: "Gqeberha",
    role: "user",
    status: "pending",
    isActive: true,
    createdAt: new Date("2026-08-01T10:00:00Z"),
  },
  {
    id: 2,
    fullName: "Musa Khumalo",
    email: "musa@example.com",
    phone: "+27 82 222 2222",
    city: "Johannesburg",
    role: "user",
    status: "approved",
    isActive: true,
    createdAt: new Date("2026-08-02T10:00:00Z"),
  },
  {
    id: 3,
    fullName: "Tara Singh",
    email: "tara@example.com",
    phone: null,
    city: "Cape Town",
    role: "user",
    status: "rejected",
    isActive: true,
    createdAt: new Date("2026-08-03T10:00:00Z"),
  },
];

describe("private access helpers", () => {
  it("counts applicants by approval status", () => {
    expect(countApplicants(applicants)).toEqual({ all: 3, pending: 1, approved: 1, rejected: 1 });
  });

  it("filters applicants by status and searchable profile fields", () => {
    expect(filterApplicants(applicants, "pending", "gqeberha").map((applicant) => applicant.id)).toEqual([1]);
    expect(filterApplicants(applicants, "all", "musa@example.com").map((applicant) => applicant.id)).toEqual([2]);
    expect(filterApplicants(applicants, "approved", "unknown")).toEqual([]);
  });

  it("generates readable applicant initials", () => {
    expect(getApplicantInitials("Aisha Daniels")).toBe("AD");
    expect(getApplicantInitials("Single")).toBe("S");
  });
});

describe("registration validation", () => {
  const validApplication = {
    fullName: "Aisha Daniels",
    email: "aisha@example.com",
    phone: "+27 82 111 1111",
    city: "Gqeberha",
    password: "secure-passphrase-that-is-32-chars!",
    confirmPassword: "secure-passphrase-that-is-32-chars!",
    isOver18: true,
  };

  it("accepts a complete 18+ application", () => {
    expect(registrationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("rejects mismatched passwords and underage applications", () => {
    const mismatch = registrationSchema.safeParse({ ...validApplication, confirmPassword: "different" });
    const underage = registrationSchema.safeParse({ ...validApplication, isOver18: false });

    expect(mismatch.success).toBe(false);
    expect(underage.success).toBe(false);
  });

  it("removes the confirmation-only field from the API payload", () => {
    expect(toRegistrationPayload(validApplication)).toEqual({
      fullName: "Aisha Daniels",
      email: "aisha@example.com",
      phone: "+27 82 111 1111",
      city: "Gqeberha",
      password: "secure-passphrase-that-is-32-chars!",
      isOver18: true,
    });
  });
});
