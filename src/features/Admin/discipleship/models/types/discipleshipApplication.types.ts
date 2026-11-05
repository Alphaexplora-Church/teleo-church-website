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
  onApprove: (applicantId: string, groupId: string) => void;
  onReject: (applicantId: string) => void;
  className?: string;
}

export interface DiscipleshipModalIntakeSchemaProps {
  isOpen: boolean;
  onClose: () => void;
  questions: IntakeQuestion[];
  onSaveSchema: (questions: IntakeQuestion[]) => void | Promise<void>;
  isLoading?: boolean;
}
