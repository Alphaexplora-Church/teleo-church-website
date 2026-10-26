import type {
  DiscipleshipGroupItem,
  GroupsScheduleUiConfig,
} from "../types/groupsScheduleViews.types";

export const GROUPS_SCHEDULE_UI: GroupsScheduleUiConfig = {
  title: "Groups & Schedule",
  description: "Church-wide discipleship management, scheduling, and prompts",
  moduleEnabledTitle: "Disable Discipleship Module",
  moduleDisabledTitle: "Enable Discipleship Module",
  discussionPromptsBtn: "Discussion Prompts",
  newGroupBtn: "New Group",
};

export const INITIAL_DISCIPLESHIP_GROUPS: readonly DiscipleshipGroupItem[] = [
  {
    id: "fig-tree",
    title: "The Fig Tree Group",
    leaderName: "Mark Reyes",
    currentSeats: 7,
    maxSeats: 10,
  },
  {
    id: "living-water",
    title: "Living Water Group",
    leaderName: "Ana Villar",
    currentSeats: 10,
    maxSeats: 10,
    isFull: true,
  },
  {
    id: "cornerstone",
    title: "Cornerstone Group",
    leaderName: "Sam Ortiz",
    currentSeats: 8,
    maxSeats: 10,
  },
  {
    id: "berean-fellowship",
    title: "Berean Fellowship Group",
    leaderName: "Daniel Santos",
    currentSeats: 9,
    maxSeats: 10,
  },
  {
    id: "grace-womens",
    title: "Grace Women's Circle Group",
    leaderName: "Esther Lim",
    currentSeats: 7,
    maxSeats: 10,
  },
  {
    id: "young-professionals",
    title: "Young Professionals Group",
    leaderName: "Marcus Tan",
    currentSeats: 8,
    maxSeats: 10,
  },
];
