export const PROPERTY_TABS = [
  { to: "/properties/all", label: "All" },
  { to: "/properties/pending", label: "Pending", status: "PENDING_REVIEW" },
  { to: "/properties/changes-requested", label: "Changes", status: "CHANGES_REQUESTED" },
  { to: "/properties/published", label: "Published", status: "PUBLISHED" },
  { to: "/properties/rejected", label: "Rejected", status: "REJECTED" },
];

export const AD_TABS = [
  { to: "/advertisements/all", label: "All" },
  { to: "/advertisements/pending", label: "Pending", status: "PENDING_REVIEW" },
  { to: "/advertisements/changes-requested", label: "Changes", status: "CHANGES_REQUESTED" },
  { to: "/advertisements/scheduled", label: "Scheduled", status: "APPROVED" },
  { to: "/advertisements/published", label: "Published", status: "PUBLISHED" },
  { to: "/advertisements/expired", label: "Expired", status: "EXPIRED" },
];

export const BREADCRUMB_LABELS = {
  dashboard: "Dashboard",
  advertisements: "Advertisements",
  properties: "Properties",
  pending: "Pending review",
  all: "All",
  "changes-requested": "Changes requested",
  published: "Published",
  rejected: "Rejected",
  scheduled: "Scheduled",
  expired: "Expired",
  reports: "Reports",
  "audit-logs": "Audit logs",
  users: "Users",
  settings: "Settings",
};
