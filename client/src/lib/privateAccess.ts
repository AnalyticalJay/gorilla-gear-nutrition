export type AccessStatus = "pending" | "approved" | "rejected";
export type StatusFilter = "all" | AccessStatus;

export type ApplicantSummary = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: "user" | "admin";
  status: AccessStatus;
  isActive: boolean;
  createdAt: Date;
};

export function getApplicantInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function countApplicants(applicants: ApplicantSummary[]) {
  return {
    all: applicants.length,
    pending: applicants.filter((applicant) => applicant.status === "pending").length,
    approved: applicants.filter((applicant) => applicant.status === "approved").length,
    rejected: applicants.filter((applicant) => applicant.status === "rejected").length,
  };
}

export function filterApplicants(applicants: ApplicantSummary[], filter: StatusFilter, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  return applicants.filter((applicant) => {
    const matchesStatus = filter === "all" || applicant.status === filter;
    const matchesSearch = !normalizedSearch || [applicant.fullName, applicant.email, applicant.phone, applicant.city]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    return matchesStatus && matchesSearch;
  });
}
