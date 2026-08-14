// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.stubGlobal("ResizeObserver", class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
});

import AdminApprovalDashboard from "./AdminApprovalDashboard";
import { RegistrationForm } from "./RegistrationForm";

const mocks = vi.hoisted(() => ({
  mockRegister: vi.fn(),
  mockApprove: vi.fn(),
  mockReject: vi.fn(),
  mockRole: vi.fn(),
  mockInvalidate: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

const applicants = [
  {
    id: 1,
    fullName: "Pending Person",
    email: "pending@example.com",
    phone: "+27 82 111 1111",
    city: "Gqeberha",
    role: "user" as const,
    status: "pending" as const,
    isActive: true,
    createdAt: new Date("2026-08-01T10:00:00Z"),
  },
  {
    id: 2,
    fullName: "Approved Person",
    email: "approved@example.com",
    phone: "+27 82 222 2222",
    city: "Cape Town",
    role: "user" as const,
    status: "approved" as const,
    isActive: true,
    createdAt: new Date("2026-08-02T10:00:00Z"),
  },
];

vi.mock("sonner", () => ({
  toast: { error: mocks.mockToastError, success: mocks.mockToastSuccess },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      register: {
        useMutation: () => ({ isPending: false, mutate: mocks.mockRegister }),
      },
    },
    admin: {
      users: {
        useQuery: () => ({ data: applicants, isLoading: false, isError: false, refetch: vi.fn() }),
      },
      approveUser: {
        useMutation: () => ({ isPending: false, mutate: mocks.mockApprove }),
      },
      rejectUser: {
        useMutation: () => ({ isPending: false, mutate: mocks.mockReject }),
      },
      setUserRole: {
        useMutation: () => ({ isPending: false, mutate: mocks.mockRole }),
      },
      stats: {
        invalidate: mocks.mockInvalidate,
      },
    },
    useUtils: () => ({
      admin: {
        users: { invalidate: mocks.mockInvalidate },
        stats: { invalidate: mocks.mockInvalidate },
      },
    }),
  },
}));

afterEach(() => cleanup());

describe("RegistrationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors and blocks submission until age is confirmed", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmitted={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText("Full name is required")).toBeInTheDocument();
    expect(screen.getByText("You must be 18 or older")).toBeInTheDocument();
    expect(mocks.mockRegister).not.toHaveBeenCalled();
  });

  it("submits the validated registration payload without confirmationPassword", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmitted={vi.fn()} />);

    await user.type(screen.getByLabelText("Full Name"), "Aisha Daniels");
    await user.type(screen.getByLabelText("Email Address"), "aisha@example.com");
    await user.type(screen.getByLabelText("Phone"), "+27 82 111 1111");
    await user.type(screen.getByLabelText("City"), "Gqeberha");
    await user.type(screen.getByLabelText("Password"), "secure-passphrase-that-is-32-chars!");
    await user.type(screen.getByLabelText("Confirm Password"), "secure-passphrase-that-is-32-chars!");
    await user.click(screen.getByLabelText(/18 years of age or older/i));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(mocks.mockRegister).toHaveBeenCalledWith({
      fullName: "Aisha Daniels",
      email: "aisha@example.com",
      phone: "+27 82 111 1111",
      city: "Gqeberha",
      password: "secure-passphrase-that-is-32-chars!",
      isOver18: true,
    });
  });
});

describe("AdminApprovalDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters the applicant list and opens the review dialog", async () => {
    const user = userEvent.setup();
    render(<AdminApprovalDashboard />);

    expect(screen.getAllByText("Pending Person").length).toBeGreaterThan(0);
    expect(screen.queryByText("Approved Person")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /all applicants 2/i }));
    expect(screen.getAllByText("Approved Person").length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /review application|view application/i })[0]!);
    expect(screen.getByRole("dialog")).toHaveTextContent("pending@example.com");
    expect(screen.getByLabelText(/internal review note/i)).toBeInTheDocument();
  });

  it("passes review notes to the approve action for pending applicants", async () => {
    const user = userEvent.setup();
    render(<AdminApprovalDashboard />);

    await user.click(screen.getAllByRole("button", { name: /review application|view application/i })[0]!);
    await user.type(screen.getByLabelText(/internal review note/i), "Verified by admin");
    await user.click(screen.getByRole("button", { name: /approve access/i }));

    expect(mocks.mockApprove).toHaveBeenCalledWith({ userId: 1, notes: "Verified by admin" });
  });

  it("allows an admin to request a role change for an approved member", async () => {
    const user = userEvent.setup();
    render(<AdminApprovalDashboard />);

    await user.click(screen.getByRole("tab", { name: /approved 1/i }));
    await user.click(screen.getAllByRole("button", { name: /view application/i })[0]!);
    await user.selectOptions(screen.getByLabelText("Account role"), "admin");

    expect(mocks.mockRole).toHaveBeenCalledWith({ userId: 2, role: "admin" });
  });

  it("shows an empty result when the search does not match", async () => {
    const user = userEvent.setup();
    render(<AdminApprovalDashboard />);

    const search = screen.getByRole("textbox", { name: /search applicants/i });
    await user.type(search, "does-not-exist");
    expect(screen.getByText("No applicants match this view")).toBeInTheDocument();
  });
});
