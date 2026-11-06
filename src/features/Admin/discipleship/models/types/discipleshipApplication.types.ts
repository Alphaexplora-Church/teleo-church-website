export type IntakeQuestionType =
  | "SHORT_TEXT"
  | "SINGLE_SELECT"
  | "PARAGRAPH"
  | "MULTIPLE_CHOICE";

export interface IntakeQuestion {
  id: string;
  title: string;
  type?: IntakeQuestionType;
  options?: string[];
  isRequired?: boolean;
}

export interface ApplicantAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
}

export interface DiscipleshipApplicant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isHomeChurch: boolean;
  churchName?: string;
  appliedRelativeTime: string; // e.g. "Applied 2 days ago"
  answers: ApplicantAnswer[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  assignedGroupId?: string;
}

export interface PlacementGroup {
  id: string;
  name: string;
  currentSeats: number;
  maxSeats: number;
  leaderName?: string;
}

export type ApplicationChurchFilter = "all" | "home_church" | "other_churches";

export interface DiscipleshipApplicationFilterProps {
  activeFilter: ApplicationChurchFilter;
  onFilterChange: (filter: ApplicationChurchFilter) => void;
  counts: {
    all: number;
    homeChurch: number;
    otherChurches: number;
  };
  onOpenIntakeSchema: () => void;
  className?: string;
}

export interface DiscipleshipApplicationDropdownGroupProps {
  groups: PlacementGroup[];
  selectedGroupId: string;
  onChange: (groupId: string) => void;
  disabled?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export interface DiscipleshipApplicationCollapsibleCardProps {
  applicant: DiscipleshipApplicant;
  availableGroups: PlacementGroup[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApprove: (applicantId: string, groupId: string) => void | Promise<void>;
  onReject: (applicantId: string, notes?: string) => void | Promise<void>;
  isProcessing?: boolean;
  className?: string;
}

export interface DiscipleshipModalIntakeSchemaProps {
  isOpen: boolean;
  onClose: () => void;
  questions: IntakeQuestion[];
  onSaveSchema: (questions: IntakeQuestion[]) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Raw backend application applicant preview from GET /api/discipleship-applications
 */
export interface ApiApplicationApplicant {
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  profile_picture_url?: string | null;
}

/**
 * Raw backend application item from GET /api/discipleship-applications
 */
export interface ApiDiscipleshipApplication {
  id: string;
  church_id: number | string;
  user_id: string;
  is_home_church?: boolean;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string;
  applicant?: ApiApplicationApplicant;
  form_response?: Record<string, unknown>;
  assigned_discipleship_id?: string | null;
  admin_notes?: string | null;
}

export interface DiscipleshipApplicationsResponse {
  applications?: ApiDiscipleshipApplication[];
}

/**
 * Full application detail from GET /api/discipleship-applications/:applicationId
 */
export interface ApiApplicationDetail {
  id: string;
  church_id: number | string;
  user_id: string;
  form_response?: Record<string, unknown>;
  status: string;
  is_home_church?: boolean;
  already_active_elsewhere?: boolean;
  active_membership_elsewhere?: string | null;
}

export interface DiscipleshipApplicationDetailResponse {
  application?: ApiApplicationDetail;
  applicant?: ApiApplicationApplicant;
}

/**
 * Payload for PATCH /api/discipleship-applications/:id
 */
export interface ReviewApplicationPayload {
  status: "approved" | "rejected";
  assigned_discipleship_id?: string;
  admin_notes?: string;
}

export interface ReviewApplicationResponse {
  status: string;
  application?: {
    id: string;
    status: string;
    assigned_discipleship_id?: string;
    reviewed_at?: string;
    admin_notes?: string;
  };
}

/**
 * Form Schema element for intake form templates
 */
export interface ApiIntakeFormField {
  id: string;
  type?: string;
  label: string;
  required?: boolean;
  options?: string[];
}

/**
 * Intake Form Template Contract from GET & POST /api/discipleship-intake-form-templates
 */
export interface ApiIntakeFormTemplate {
  template_id?: string;
  id?: string;
  church_id?: number | string;
  form_schema?: ApiIntakeFormField[] | unknown;
  is_active?: boolean;
  created_at?: string;
}

export interface IntakeFormTemplateResponse {
  template?: ApiIntakeFormTemplate;
  template_id?: string;
  id?: string;
  church_id?: number | string;
  form_schema?: ApiIntakeFormField[] | unknown;
  is_active?: boolean;
}

export interface CreateIntakeTemplatePayload {
  church_id?: number | string;
  form_schema: ApiIntakeFormField[];
}

