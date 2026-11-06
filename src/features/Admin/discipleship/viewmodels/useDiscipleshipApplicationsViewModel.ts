import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "../../../../shared/context/useAuth";
import {
  useAbortController,
  isAbortError,
} from "../../../../shared/viewmodels/useAbortController";
import { getApiErrorMessage } from "../../../../shared/models/api/axiosClient.api";
import { DiscipleshipGroupListApi } from "../models/api/discipleshipGroupList.api";
import { DiscipleshipApplicationsApi } from "../models/api/discipleshipApplications.api";
import {
  mapApiGroupToPlacementGroup,
  mapApiApplicationToApplicant,
} from "../models/utils/discipleshipApplication.utils";
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

  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [processingApplicantIds, setProcessingApplicantIds] = useState<string[]>([]);
  const [reviewError, setReviewError] = useState<string | null>(null);

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

  /**
   * Fetches pending applications for the church from backend
   */
  const fetchApplications = useCallback(async () => {
    setIsLoadingApplications(true);
    setApplicationsError(null);
    const signal = getSignal();

    try {
      const rawApps = await DiscipleshipApplicationsApi.getApplications(
        { status: "pending", churchId },
        signal,
      );
      const mapped = rawApps.map(mapApiApplicationToApplicant);
      discipleshipApplicationsStore.setApplicants(mapped);

      // Auto-expand first pending applicant if none expanded
      if (mapped.length > 0) {
        setExpandedApplicantIds((prev) => (prev.length === 0 ? [mapped[0].id] : prev));
      }
    } catch (err) {
      if (isAbortError(err)) return;
      const message = getApiErrorMessage(err);
      setApplicationsError(message || "Failed to load discipleship applications.");
    } finally {
      setIsLoadingApplications(false);
    }
  }, [churchId, getSignal]);

  /**
   * Fetches available placement groups from church dashboard
   */
  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const signal = getSignal();
      const data = await DiscipleshipGroupListApi.getDiscipleshipDashboard(
        churchId,
        signal,
      );
      if (data.groups) {
        const mapped = data.groups.map(mapApiGroupToPlacementGroup);
        setPlacementGroups(mapped);
      }
    } catch (err) {
      if (!isAbortError(err)) {
        setPlacementGroups([]);
      }
    } finally {
      setIsLoadingGroups(false);
    }
  }, [churchId, getSignal]);

  // Initial Fetch on mount or churchId change
  useEffect(() => {
    if (options?.initialApplicants) {
      discipleshipApplicationsStore.setApplicants(options.initialApplicants);
      setIsLoadingApplications(false);
    } else {
      void fetchApplications();
    }

    if (options?.initialGroups) {
      setPlacementGroups(options.initialGroups);
      setIsLoadingGroups(false);
    } else {
      void fetchGroups();
    }
  }, [churchId, fetchApplications, fetchGroups, options?.initialApplicants, options?.initialGroups]);

  // 5. Intake Schema Modal State & Questions
  const [isIntakeSchemaOpen, setIsIntakeSchemaOpen] = useState(false);
  const [intakeQuestions, setIntakeQuestions] = useState<IntakeQuestion[]>(
    options?.initialQuestions ?? [],
  );
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  /**
   * Fetches active intake form template for the church from backend
   */
  const fetchIntakeSchema = useCallback(async () => {
    try {
      const signal = getSignal();
      const template = await DiscipleshipApplicationsApi.getIntakeTemplate(
        churchId,
        signal,
      );
      if (template && template.form_schema && Array.isArray(template.form_schema)) {
        const mappedQuestions: IntakeQuestion[] = template.form_schema.map(
          (field: Record<string, unknown>, idx: number) => ({
            id: String(field.id || `q-${idx + 1}`),
            title: String(field.label || field.title || `Question ${idx + 1}`),
            isRequired: (field.required as boolean | undefined) ?? true,
            type: field.type as IntakeQuestion["type"],
            options: Array.isArray(field.options) ? (field.options as string[]) : undefined,
          }),
        );
        setIntakeQuestions(mappedQuestions);
      }
    } catch (err) {
      if (!isAbortError(err)) {
        // Non-blocking fallback: keeps default or initial questions
      }
    }
  }, [churchId, getSignal]);

  useEffect(() => {
    if (!options?.initialQuestions) {
      void fetchIntakeSchema();
    }
  }, [fetchIntakeSchema, options?.initialQuestions]);

  const handleOpenIntakeSchema = () => {
    setSchemaError(null);
    setIsIntakeSchemaOpen(true);
  };
  const handleCloseIntakeSchema = () => {
    setSchemaError(null);
    setIsIntakeSchemaOpen(false);
  };

  const handleSaveIntakeSchema = async (updated: IntakeQuestion[]) => {
    setIsSavingSchema(true);
    setSchemaError(null);
    try {
      const payloadSchema = updated.map((q) => ({
        id: q.id,
        label: q.title,
        required: q.isRequired ?? true,
        type: q.type ?? "text",
        options: q.options,
      }));

      await DiscipleshipApplicationsApi.saveIntakeTemplate({
        church_id: churchId,
        form_schema: payloadSchema,
      });

      setIntakeQuestions(updated);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setSchemaError(message || "Failed to save intake questions template.");
      throw err;
    } finally {
      setIsSavingSchema(false);
    }
  };

  // 6. Action Handlers (Approve & Place, Reject) with real backend API calls
  const handleApproveApplicant = useCallback(
    async (applicantId: string, groupId: string) => {
      if (processingApplicantIds.includes(applicantId)) return;
      setProcessingApplicantIds((prev) => [...prev, applicantId]);
      setReviewError(null);

      try {
        await DiscipleshipApplicationsApi.reviewApplication(applicantId, {
          status: "approved",
          assigned_discipleship_id: groupId,
        });

        // Update in-memory store
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

        // Auto-refresh applications queue and groups in background
        void fetchApplications();
        void fetchGroups();
      } catch (err) {
        const message = getApiErrorMessage(err);
        setReviewError(message || "Failed to approve application.");
      } finally {
        setProcessingApplicantIds((prev) => prev.filter((id) => id !== applicantId));
      }
    },
    [fetchApplications, fetchGroups, processingApplicantIds],
  );

  const handleRejectApplicant = useCallback(
    async (applicantId: string, notes?: string) => {
      if (processingApplicantIds.includes(applicantId)) return;
      setProcessingApplicantIds((prev) => [...prev, applicantId]);
      setReviewError(null);

      try {
        await DiscipleshipApplicationsApi.reviewApplication(applicantId, {
          status: "rejected",
          admin_notes: notes,
        });

        discipleshipApplicationsStore.setApplicants((prev) =>
          prev.map((app) =>
            app.id === applicantId ? { ...app, status: "REJECTED" } : app,
          ),
        );

        // Auto-refresh applications queue in background
        void fetchApplications();
      } catch (err) {
        const message = getApiErrorMessage(err);
        setReviewError(message || "Failed to reject application.");
      } finally {
        setProcessingApplicantIds((prev) => prev.filter((id) => id !== applicantId));
      }
    },
    [fetchApplications, processingApplicantIds],
  );

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
    isLoading: isLoadingApplications || isLoadingGroups,
    error: applicationsError,
    reviewError,
    clearReviewError: () => setReviewError(null),
    processingApplicantIds,
    onRetry: () => {
      void fetchApplications();
      void fetchGroups();
    },
    actions: {
      onApprove: handleApproveApplicant,
      onReject: handleRejectApplicant,
    },
    intakeSchema: {
      isOpen: isIntakeSchemaOpen,
      questions: intakeQuestions,
      isLoading: isSavingSchema,
      error: schemaError,
      onOpen: handleOpenIntakeSchema,
      onClose: handleCloseIntakeSchema,
      onSave: handleSaveIntakeSchema,
    },
  };
}

export default useDiscipleshipApplicationsViewModel;
