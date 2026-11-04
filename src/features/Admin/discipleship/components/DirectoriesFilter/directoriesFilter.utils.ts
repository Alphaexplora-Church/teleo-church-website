/**
 * Helper function to filter discipleship groups by search query (matching group title or leader name)
 * and selected leader checklist filters.
 */
export function filterDiscipleshipGroups<
  T extends { title: string; leaderName: string },
>(
  groups: readonly T[],
  searchQuery = "",
  selectedLeaders: readonly string[] = [],
): T[] {
  const query = searchQuery.trim().toLowerCase();

  return groups.filter((group) => {
    // 1. Matches group title OR leader name
    const matchesSearch =
      !query ||
      group.title.toLowerCase().includes(query) ||
      group.leaderName.toLowerCase().includes(query);

    // 2. Matches any of the selected leader names (if any are selected)
    const matchesLeader =
      selectedLeaders.length === 0 ||
      selectedLeaders.includes(group.leaderName);

    return matchesSearch && matchesLeader;
  });
}
