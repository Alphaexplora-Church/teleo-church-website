import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "../../../../shared/context/useAuth";
import {
  useAbortController,
  isAbortError,
} from "../../../../shared/viewmodels/useAbortController";
import { DiscipleshipGroupListApi } from "../models/api/discipleshipGroupList.api";
import { mapApiGroupToPlacementGroup } from "../models/utils/discipleshipApplication.utils";
import { discipleshipApplicationsStore } from "../models/utils/discipleshipApplication.store";
import type {
  ApplicationChurchFilter,
  DiscipleshipApplicant,
  IntakeQuestion,
  PlacementGroup,
} from "../models/types/discipleshipApplication.types";

export {
  discipleshipApplicationsStore,
  usePendingApplicationsCount,
} from "../models/utils/discipleshipApplication.store";

export interface UseDiscipleshipApplicationsViewModelOptions {
  /** Optional churchId override; defaults to authenticated user's home_church_id */
  churchId?: string | number;
  /** Optional initial applicants list (defaults to empty array []) */
  initialApplicants?: DiscipleshipApplicant[];
  /** Optional initial placement groups (defaults to dynamic fetch from API) */
  initialGroups?: PlacementGroup[];
  /** Optional initial intake questions (defaults to empty array []) */
  initialQuestions?: IntakeQuestion[];
}

export function useDiscipleshipApplicationsViewModel(
  options?: UseDiscipleshipApplicationsViewModelOptions,
) {
  const { user } = useAuth();
  const churchId = options?.churchId ?? user?.home_church_id ?? 1;
  const { getSignal } = useAbortController();

  // 1. Applications List State (synchronized with global store for navigation badge reactivity)
  const applicants = useSyncExternalStore(
    discipleshipApplicationsStore.subscribe,
    discipleshipApplicationsStore.getApplicants,
  );

  useEffect(() => {
    if (options?.initialApplicants) {
      discipleshipApplicationsStore.setApplicants(options.initialApplicants);
    }
  }, [options?.initialApplicants]);

  // 2. Filter State: "all" | "home_church" | "other_churches"
  const [activeFilter, setActiveFilter] = useState<ApplicationChurchFilter>("all");

  // 3. Expanded Card Tracking
  const [expandedApplicantIds, setExpandedApplicantIds] = useState<string[]>(() => {
    const initial = options?.initialApplicants ?? discipleshipApplicationsStore.getApplicants();
    return initial.length > 0 ? [initial[0].id] : [];
  });

  const handleToggleExpand = (applicantId: string) => {
    setExpandedApplicantIds((prev) =>
      prev.includes(applicantId)
        ? prev.filter((id) => id !== applicantId)
        : [...prev, applicantId],
    );
  };

  // 4. Placement Groups State (dynamic, fetched from API or passed via props)
  const [placementGroups, setPlacementGroups] = useState<PlacementGroup[]>(
    options?.initialGroups ?? [],
  );
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Fetch placement groups dynamically from API if not passed in options
  useEffect(() => {
    if (options?.initialGroups) {
      setPlacementGroups(options.initialGroups);
      return;
    }

    let isMounted = true;
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const signal = getSignal();
        const data = await DiscipleshipGroupListApi.getDiscipleshipDashboard(
          churchId,
          signal,
        );
        if (isMounted && data.groups) {
          const mapped = data.groups.map(mapApiGroupToPlacementGroup);
          setPlacementGroups(mapped);
        }
      } catch (err) {
        if (!isAbortError(err)) {
          if (isMounted) setPlacementGroups([]);
        }
      } finally {
        if (isMounted) setIsLoadingGroups(false);
      }
    };

    fetchGroups();

    return () => {
      isMounted = false;
    };
  }, [churchId, options?.initialGroups, getSignal]);

  // 5. Intake Schema Modal State & Questions (starts empty [])
  const [isIntakeSchemaOpen, setIsIntakeSchemaOpen] = useState(false);
  const [intakeQuestions, setIntakeQuestions] = useState<IntakeQuestion[]>(
    options?.initialQuestions ?? [],
  );
  const [isSavingSchema, setIsSavingSchema] = useState(false);

  const handleOpenIntakeSchema = () => setIsIntakeSchemaOpen(true);
  const handleCloseIntakeSchema = () => setIsIntakeSchemaOpen(false);

  const handleSaveIntakeSchema = async (updated: IntakeQuestion[]) => {
    setIsSavingSchema(true);
    try {
      setIntakeQuestions(updated);
    } finally {
      setIsSavingSchema(false);
    }
  };

  // 6. Action Handlers (Approve & Place, Reject)
  const handleApproveApplicant = (applicantId: string, groupId: string) => {
    discipleshipApplicationsStore.setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId
          ? { ...app, status: "APPROVED", assignedGroupId: groupId }
          : app,
      ),
    );

    setPlacementGroups((prev) =>
      prev.map((group) =>
        group.id === groupId && group.currentSeats < group.maxSeats
          ? { ...group, currentSeats: group.currentSeats + 1 }
          : group,
      ),
    );
  };

  const handleRejectApplicant = (applicantId: string) => {
    discipleshipApplicationsStore.setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, status: "REJECTED" } : app,
      ),
    );
  };

  // 7. Dynamic Counts (pure, direct computation)
  const pendingApplicants = applicants.filter((a) => a.status === "PENDING");
  const counts = {
    all: pendingApplicants.length,
    homeChurch: pendingApplicants.filter((a) => a.isHomeChurch).length,
    otherChurches: pendingApplicants.filter((a) => !a.isHomeChurch).length,
  };

  // 8. Filtered Pending Applicants (pure, direct computation)
  const filteredApplicants = pendingApplicants.filter((applicant) => {
    if (activeFilter === "home_church") return applicant.isHomeChurch;
    if (activeFilter === "other_churches") return !applicant.isHomeChurch;
    return true;
  });

  return {
    filter: {
      active: activeFilter,
      onChange: setActiveFilter,
      counts,
    },
    applicants: filteredApplicants,
    allApplicants: applicants,
    setApplicants: discipleshipApplicationsStore.setApplicants,
    expandedApplicantIds,
    onToggleExpand: handleToggleExpand,
    availableGroups: placementGroups,
    isLoadingGroups,
    actions: {
      onApprove: handleApproveApplicant,
      onReject: handleRejectApplicant,
    },
    intakeSchema: {
      isOpen: isIntakeSchemaOpen,
      questions: intakeQuestions,
      isLoading: isSavingSchema,
      onOpen: handleOpenIntakeSchema,
      onClose: handleCloseIntakeSchema,
      onSave: handleSaveIntakeSchema,
    },
  };
}

export default useDiscipleshipApplicationsViewModel;
