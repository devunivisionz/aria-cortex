// types/dna-segment.ts

// ==========================================
// STATUS TYPES
// ==========================================

export type DNASegmentStatus = "draft" | "active" | "paused";

// ==========================================
// EMAIL POLICY
// ==========================================

export interface EmailPolicy {
  require_verified: boolean;
  allow_generic: boolean;
  allow_catchall: boolean;
  max_per_company: number;
}

export const initialEmailPolicy: EmailPolicy = {
  require_verified: true,
  allow_generic: false,
  allow_catchall: false,
  max_per_company: 3,
};

// ==========================================
// DNA SEGMENT - DATABASE MODEL
// ==========================================

export interface DNASegment {
  id: string;
  mandate_id: string;
  organization_id: string;
  created_by: string;
  name: string;
  description: string | null;
  status: DNASegmentStatus;
  geo_allow: string[];
  geo_block: string[];
  industry_allow: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  excluded_keywords: string[];
  contact_roles: string[];
  email_policy: EmailPolicy;
  leads_count: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// DNA SEGMENT - FORM DATA (for create/edit)
// ==========================================

export interface DNASegmentFormData {
  name: string;
  description: string;
  status: DNASegmentStatus;
  geo_allow: string[];
  geo_block: string[];
  industry_allow: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  excluded_keywords: string[];
  contact_roles: string[];
  email_policy: EmailPolicy;
}

export const initialDNAFormData: DNASegmentFormData = {
  name: "",
  description: "",
  status: "draft",
  geo_allow: [],
  geo_block: [],
  industry_allow: [],
  size_employees_min: null,
  size_employees_max: null,
  revenue_min: null,
  revenue_max: null,
  excluded_keywords: [],
  contact_roles: [],
  email_policy: initialEmailPolicy,
};

// ==========================================
// DNA SEGMENT - CREATE PAYLOAD (for API)
// ==========================================

export interface CreateDNASegmentPayload {
  mandate_id: string;
  organization_id: string;
  created_by: string;
  name: string;
  description: string | null;
  status: DNASegmentStatus;
  geo_allow: string[];
  geo_block: string[];
  industry_allow: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  excluded_keywords: string[];
  contact_roles: string[];
  email_policy: EmailPolicy;
}

// ==========================================
// DNA SEGMENT - UPDATE PAYLOAD (for API)
// ==========================================

export interface UpdateDNASegmentPayload {
  name?: string;
  description?: string | null;
  status?: DNASegmentStatus;
  geo_allow?: string[];
  geo_block?: string[];
  industry_allow?: string[];
  size_employees_min?: number | null;
  size_employees_max?: number | null;
  revenue_min?: number | null;
  revenue_max?: number | null;
  excluded_keywords?: string[];
  contact_roles?: string[];
  email_policy?: EmailPolicy;
  updated_at?: string;
}

// ==========================================
// DNA SEGMENT - FILTERS (for list page)
// ==========================================

export interface DNASegmentFilters {
  search: string;
  status: DNASegmentStatus | "all";
  sortBy: "created_at" | "name" | "leads_count";
  sortOrder: "asc" | "desc";
}

export const initialDNASegmentFilters: DNASegmentFilters = {
  search: "",
  status: "all",
  sortBy: "created_at",
  sortOrder: "desc",
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Convert DNASegment (from DB) to DNASegmentFormData (for editing)
 */
export function segmentToFormData(segment: DNASegment): DNASegmentFormData {
  return {
    name: segment.name,
    description: segment.description || "",
    status: segment.status,
    geo_allow: segment.geo_allow || [],
    geo_block: segment.geo_block || [],
    industry_allow: segment.industry_allow || [],
    size_employees_min: segment.size_employees_min,
    size_employees_max: segment.size_employees_max,
    revenue_min: segment.revenue_min,
    revenue_max: segment.revenue_max,
    excluded_keywords: segment.excluded_keywords || [],
    contact_roles: segment.contact_roles || [],
    email_policy: segment.email_policy || initialEmailPolicy,
  };
}

/**
 * Convert DNASegmentFormData to CreateDNASegmentPayload
 */
export function formDataToPayload(
  formData: DNASegmentFormData,
  mandateId: string,
  organizationId: string,
  userId: string
): CreateDNASegmentPayload {
  return {
    mandate_id: mandateId,
    organization_id: organizationId,
    created_by: userId,
    name: formData.name,
    description: formData.description || null,
    status: formData.status,
    geo_allow: formData.geo_allow,
    geo_block: formData.geo_block,
    industry_allow: formData.industry_allow,
    size_employees_min: formData.size_employees_min,
    size_employees_max: formData.size_employees_max,
    revenue_min: formData.revenue_min,
    revenue_max: formData.revenue_max,
    excluded_keywords: formData.excluded_keywords,
    contact_roles: formData.contact_roles,
    email_policy: formData.email_policy,
  };
}

/**
 * Validate form data before submission
 */
export function validateDNAFormData(formData: DNASegmentFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push("Segment name is required");
  }

  if (formData.name.length > 100) {
    errors.push("Segment name must be less than 100 characters");
  }

  if (formData.description && formData.description.length > 500) {
    errors.push("Description must be less than 500 characters");
  }

  if (
    formData.size_employees_min &&
    formData.size_employees_max &&
    formData.size_employees_min > formData.size_employees_max
  ) {
    errors.push("Min employees cannot be greater than max employees");
  }

  if (
    formData.revenue_min &&
    formData.revenue_max &&
    formData.revenue_min > formData.revenue_max
  ) {
    errors.push("Min revenue cannot be greater than max revenue");
  }

  if (formData.email_policy.max_per_company < 1) {
    errors.push("Max contacts per company must be at least 1");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get summary text for a DNA segment (for cards/lists)
 */
export function getDNASegmentSummary(segment: DNASegment): {
  geography: string;
  company: string;
  contacts: string;
} {
  // Geography summary
  let geography = "Any location";
  if (segment.geo_allow.length > 0) {
    geography = segment.geo_allow.slice(0, 3).join(", ");
    if (segment.geo_allow.length > 3) {
      geography += ` +${segment.geo_allow.length - 3}`;
    }
  }

  // Company summary
  const companyParts: string[] = [];
  if (segment.size_employees_min || segment.size_employees_max) {
    if (segment.size_employees_min && segment.size_employees_max) {
      companyParts.push(
        `${segment.size_employees_min}-${segment.size_employees_max} emp`
      );
    } else if (segment.size_employees_min) {
      companyParts.push(`${segment.size_employees_min}+ emp`);
    } else {
      companyParts.push(`Up to ${segment.size_employees_max} emp`);
    }
  }
  if (segment.industry_allow.length > 0) {
    companyParts.push(segment.industry_allow.slice(0, 2).join(", "));
  }
  const company =
    companyParts.length > 0 ? companyParts.join(" • ") : "Any company";

  // Contacts summary
  let contacts = "Any role";
  if (segment.contact_roles.length > 0) {
    contacts = `${segment.contact_roles.length} role${
      segment.contact_roles.length !== 1 ? "s" : ""
    }`;
  }

  return { geography, company, contacts };
}
