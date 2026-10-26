import type { DiscipleshipGroupItem } from "../../components/DiscipleshipCardList/DiscipleshipGroupCardList";
import type { DiscipleshipTab } from "../../components/DiscipleshipTabSwitch/DiscipleshipTabSwitch";

export type { DiscipleshipGroupItem, DiscipleshipTab };

export interface GroupsScheduleUiConfig {
  readonly title: string;
  readonly description: string;
  readonly moduleEnabledTitle: string;
  readonly moduleDisabledTitle: string;
  readonly discussionPromptsBtn?: string;
  readonly newGroupBtn?: string;
}
