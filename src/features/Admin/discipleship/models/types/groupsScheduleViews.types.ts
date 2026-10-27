import type {
  DiscipleshipGroupItem,
  LeaderFilterOption,
} from "./groupsScheduleDirectory.types";

export interface GroupsScheduleUiConfig {
  readonly title: string;
  readonly description: string;
  readonly calendarPlaceholder: string;
}

export interface DiscipleshipApplicationsUiConfig {
  readonly title: string;
  readonly description: string;
}

export interface DiscipleshipDirectoryFilterState {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  leaders: readonly LeaderFilterOption[];
  selectedLeaders: readonly string[];
  onLeaderToggle: (name: string) => void;
  onClearLeaders: () => void;
}

export interface DiscipleshipDirectoryStatus {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export interface DiscipleshipGroupsScheduleDirectoryProps {
  groups: readonly DiscipleshipGroupItem[];
  totalCount: number;
  filter: DiscipleshipDirectoryFilterState;
  status: DiscipleshipDirectoryStatus;
  onNewGroupClick: () => void;
  onDiscussionPromptsClick: () => void;
}
