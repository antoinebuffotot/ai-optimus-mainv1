import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUserDetails } from "@dynatrace-sdk/app-environment";
import { useAppState, useSetAppState } from "@dynatrace-sdk/react-hooks";
import {
  getLearningContent,
  getLearningItemCount,
  learningContent,
} from "../lib/learning-content";

const SHARED_KEY = "ai-optimus.learn.activity-shared.v1";
// The state-service caps cross-user app state validUntilTime at now+90d.
const SHARED_TTL = "now+90d";
const FALLBACK_PREFIX = "ai-optimus.learn.activity";

export type LearningItemKind = "prerequisite" | "step";

export interface SubjectActivity {
  openedAt: number | null;
  prerequisites: Record<string, number>;
  steps: Record<string, number>;
}

export interface ActivityState {
  [capabilityId: string]: SubjectActivity;
}

export interface UserActivity {
  userEmail: string;
  state: ActivityState;
}

interface SharedActivity {
  users: Record<string, ActivityState>;
  updatedAt: number;
}

const emptySubject = (): SubjectActivity => ({
  openedAt: null,
  prerequisites: {},
  steps: {},
});

const emptyShared = (): SharedActivity => ({ users: {}, updatedAt: 0 });

const getUserEmail = (): string => {
  try {
    return getCurrentUserDetails().email || "anonymous";
  } catch {
    return "anonymous";
  }
};

const parseShared = (raw: string | undefined): SharedActivity => {
  if (!raw) return emptyShared();
  try {
    const parsed = JSON.parse(raw) as Partial<SharedActivity>;
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.users &&
      typeof parsed.users === "object"
    ) {
      return {
        users: parsed.users,
        updatedAt: parsed.updatedAt ?? 0,
      };
    }
  } catch {
    // ignore
  }
  return emptyShared();
};

const fallbackKey = (email: string): string => `${FALLBACK_PREFIX}.${email}`;

const readFallback = (email: string): ActivityState => {
  try {
    const raw = window.localStorage.getItem(fallbackKey(email));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      userEmail?: string;
      state?: ActivityState;
    };
    if (parsed && parsed.userEmail === email && parsed.state) {
      return parsed.state;
    }
  } catch {
    // ignore
  }
  return {};
};

const writeFallback = (email: string, state: ActivityState): void => {
  try {
    window.localStorage.setItem(
      fallbackKey(email),
      JSON.stringify({ userEmail: email, state })
    );
  } catch {
    // ignore
  }
};

const readFallbackAll = (): UserActivity[] => {
  const users: UserActivity[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(`${FALLBACK_PREFIX}.`)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as {
          userEmail?: string;
          state?: ActivityState;
        };
        if (parsed && parsed.userEmail && parsed.state) {
          users.push({ userEmail: parsed.userEmail, state: parsed.state });
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return users;
};

const mergeUsers = (
  shared: SharedActivity,
  fallback: UserActivity[]
): Record<string, ActivityState> => {
  const merged: Record<string, ActivityState> = { ...shared.users };
  for (const u of fallback) {
    if (!merged[u.userEmail]) merged[u.userEmail] = u.state;
  }
  return merged;
};

export const computeSubjectScore = (
  capabilityId: string,
  activity: SubjectActivity | undefined
): number => {
  const content = getLearningContent(capabilityId);
  if (!content) return 0;
  const total = getLearningItemCount(content);
  if (total === 0) return 0;
  if (!activity) return 0;
  const opened =
    Object.keys(activity.prerequisites).length +
    Object.keys(activity.steps).length;
  return Math.round((Math.min(opened, total) / total) * 100);
};

export const computeOverallScore = (state: ActivityState): number => {
  const subjects = learningContent;
  if (subjects.length === 0) return 0;
  const total = subjects.reduce(
    (acc, c) => acc + computeSubjectScore(c.capabilityId, state[c.capabilityId]),
    0
  );
  return Math.round(total / subjects.length);
};

export const hasStartedSubject = (
  activity: SubjectActivity | undefined
): boolean => {
  if (!activity) return false;
  return (
    activity.openedAt !== null ||
    Object.keys(activity.prerequisites).length > 0 ||
    Object.keys(activity.steps).length > 0
  );
};

export const hasCompletedSubject = (
  capabilityId: string,
  activity: SubjectActivity | undefined
): boolean => computeSubjectScore(capabilityId, activity) === 100;

export const hasStartedAnyLearning = (state: ActivityState): boolean =>
  learningContent.some((c) => hasStartedSubject(state[c.capabilityId]));

export const hasCompletedAllLearning = (state: ActivityState): boolean =>
  learningContent.every((c) =>
    hasCompletedSubject(c.capabilityId, state[c.capabilityId])
  );

export const countStartedSubjects = (state: ActivityState): number =>
  learningContent.reduce(
    (acc, c) => acc + (hasStartedSubject(state[c.capabilityId]) ? 1 : 0),
    0
  );

export const countCompletedSubjects = (state: ActivityState): number =>
  learningContent.reduce(
    (acc, c) =>
      acc + (hasCompletedSubject(c.capabilityId, state[c.capabilityId]) ? 1 : 0),
    0
  );

export interface UserSummary {
  userEmail: string;
  startedSubjects: number;
  completedSubjects: number;
}

export interface LearningStats {
  totalUsers: number;
  startedCount: number;
  completedCount: number;
  startedSubjectsCount: number;
  completedSubjectsCount: number;
  completionPercent: number;
  perSubject: Record<
    string,
    { startedCount: number; completedCount: number; users: UserSummary[] }
  >;
  perUser: UserSummary[];
}

export const computeLearningStats = (users: UserActivity[]): LearningStats => {
  const perSubject: LearningStats["perSubject"] = {};
  for (const c of learningContent) {
    perSubject[c.capabilityId] = {
      startedCount: 0,
      completedCount: 0,
      users: [],
    };
  }
  let startedCount = 0;
  let completedCount = 0;
  let startedSubjectsCount = 0;
  let completedSubjectsCount = 0;
  const perUser: UserSummary[] = [];
  for (const u of users) {
    const userStarted = countStartedSubjects(u.state);
    const userCompleted = countCompletedSubjects(u.state);
    const summary: UserSummary = {
      userEmail: u.userEmail,
      startedSubjects: userStarted,
      completedSubjects: userCompleted,
    };
    if (hasStartedAnyLearning(u.state)) {
      startedCount += 1;
      perUser.push(summary);
    }
    if (hasCompletedAllLearning(u.state)) completedCount += 1;
    startedSubjectsCount += userStarted;
    completedSubjectsCount += userCompleted;
    for (const c of learningContent) {
      const subject = u.state[c.capabilityId];
      if (hasStartedSubject(subject)) {
        perSubject[c.capabilityId].startedCount += 1;
        perSubject[c.capabilityId].users.push(summary);
      }
      if (hasCompletedSubject(c.capabilityId, subject)) {
        perSubject[c.capabilityId].completedCount += 1;
      }
    }
  }
  const totalSubjects = learningContent.length;
  const completionPercent =
    users.length === 0 || totalSubjects === 0
      ? 0
      : Math.round(
          (completedSubjectsCount / (users.length * totalSubjects)) * 100
        );
  return {
    totalUsers: users.length,
    startedCount,
    completedCount,
    startedSubjectsCount,
    completedSubjectsCount,
    completionPercent,
    perSubject,
    perUser,
  };
};

export interface LearningActivityApi {
  userEmail: string;
  state: ActivityState;
  subjectScore: (capabilityId: string) => number;
  isOpened: (
    capabilityId: string,
    kind: LearningItemKind,
    itemId: string
  ) => boolean;
  trackSubjectOpen: (capabilityId: string) => void;
  trackItemOpen: (
    capabilityId: string,
    kind: LearningItemKind,
    itemId: string
  ) => void;
  error: Error | null;
}

const applySubjectOpen = (
  state: ActivityState,
  capabilityId: string
): ActivityState => {
  const subject = state[capabilityId] ?? emptySubject();
  if (subject.openedAt) return state;
  return { ...state, [capabilityId]: { ...subject, openedAt: Date.now() } };
};

const applyItemOpen = (
  state: ActivityState,
  capabilityId: string,
  kind: LearningItemKind,
  itemId: string
): ActivityState => {
  const subject = state[capabilityId] ?? emptySubject();
  const bucketKey = kind === "prerequisite" ? "prerequisites" : "steps";
  if (subject[bucketKey][itemId]) return state;
  return {
    ...state,
    [capabilityId]: {
      ...subject,
      openedAt: subject.openedAt ?? Date.now(),
      [bucketKey]: { ...subject[bucketKey], [itemId]: Date.now() },
    },
  };
};

const isMissingKeyError = (
  err: Error | undefined,
  details: { code?: number } | undefined
): boolean => {
  if (!err) return false;
  if (details?.code === 404) return true;
  return /unknown key|not found/i.test(err.message);
};

export const useLearningActivity = (): LearningActivityApi => {
  const userEmail = useMemo(() => getUserEmail(), []);
  const {
    data,
    refetch,
    error: readError,
    errorDetails: readErrorDetails,
  } = useAppState({ key: SHARED_KEY });
  const { execute: setShared, error: writeError } = useSetAppState();

  const remote = useMemo(() => parseShared(data?.value), [data]);
  const initialState = useMemo<ActivityState>(
    () => remote.users[userEmail] ?? readFallback(userEmail),
    [remote, userEmail]
  );
  const [state, setState] = useState<ActivityState>(initialState);

  useEffect(() => {
    const remoteState = remote.users[userEmail];
    if (remoteState) setState(remoteState);
  }, [remote, userEmail]);

  useEffect(() => {
    writeFallback(userEmail, state);
  }, [userEmail, state]);

  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!isMissingKeyError(readError, readErrorDetails)) return;
    seededRef.current = true;
    void (async () => {
      try {
        await setShared({
          key: SHARED_KEY,
          body: {
            value: JSON.stringify(emptyShared()),
            validUntilTime: SHARED_TTL,
          },
        });
        try {
          await refetch();
        } catch {
          // ignore
        }
      } catch {
        // ignore — write may be denied; localStorage fallback still works
      }
    })();
  }, [readError, readErrorDetails, refetch, setShared]);

  const persistRemote = useCallback(
    async (next: ActivityState) => {
      let freshShared: SharedActivity = emptyShared();
      try {
        const fresh = await refetch();
        freshShared = parseShared(fresh?.value);
      } catch {
        // First write on a tenant returns 404 ("Unknown key"); proceed with
        // an empty shared map so the very first setShared creates the key.
      }
      try {
        const updated: SharedActivity = {
          users: { ...freshShared.users, [userEmail]: next },
          updatedAt: Date.now(),
        };
        await setShared({
          key: SHARED_KEY,
          body: { value: JSON.stringify(updated), validUntilTime: SHARED_TTL },
        });
        try {
          await refetch();
        } catch {
          // ignore — the next read will see the new value
        }
      } catch {
        // localStorage fallback is already kept current by the effect above
      }
    },
    [refetch, setShared, userEmail]
  );

  const trackSubjectOpen = useCallback(
    (capabilityId: string) => {
      setState((prev) => {
        const next = applySubjectOpen(prev, capabilityId);
        if (next !== prev) void persistRemote(next);
        return next;
      });
    },
    [persistRemote]
  );

  const trackItemOpen = useCallback(
    (capabilityId: string, kind: LearningItemKind, itemId: string) => {
      setState((prev) => {
        const next = applyItemOpen(prev, capabilityId, kind, itemId);
        if (next !== prev) void persistRemote(next);
        return next;
      });
    },
    [persistRemote]
  );

  const subjectScore = useCallback(
    (capabilityId: string) =>
      computeSubjectScore(capabilityId, state[capabilityId]),
    [state]
  );

  const isOpened = useCallback(
    (capabilityId: string, kind: LearningItemKind, itemId: string) => {
      const subject = state[capabilityId];
      if (!subject) return false;
      const bucket =
        kind === "prerequisite" ? subject.prerequisites : subject.steps;
      return Boolean(bucket[itemId]);
    },
    [state]
  );

  const effectiveReadError = isMissingKeyError(readError, readErrorDetails)
    ? undefined
    : readError;

  return {
    userEmail,
    state,
    subjectScore,
    isOpened,
    trackSubjectOpen,
    trackItemOpen,
    error: writeError ?? effectiveReadError ?? null,
  };
};

export interface AllLearningActivityApi {
  users: UserActivity[];
  stats: LearningStats;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  resetUser: (email: string) => Promise<void>;
}

export const useAllLearningActivity = (): AllLearningActivityApi => {
  const {
    data,
    refetch,
    isLoading,
    error,
    errorDetails,
  } = useAppState({ key: SHARED_KEY });
  const { execute: setShared } = useSetAppState();

  const users = useMemo<UserActivity[]>(() => {
    const remote = parseShared(data?.value);
    const merged = mergeUsers(remote, readFallbackAll());
    return Object.entries(merged).map(([userEmail, state]) => ({
      userEmail,
      state,
    }));
  }, [data]);

  const stats = useMemo(() => computeLearningStats(users), [users]);

  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch {
      // surfaced via error
    }
  }, [refetch]);

  const resetUser = useCallback(
    async (email: string) => {
      let freshShared: SharedActivity = emptyShared();
      try {
        const fresh = await refetch();
        freshShared = parseShared(fresh?.value);
      } catch {
        // 404 = shared key not created yet; nothing remote to reset.
      }
      try {
        const remainingUsers: Record<string, ActivityState> = {};
        for (const [key, value] of Object.entries(freshShared.users)) {
          if (key !== email) remainingUsers[key] = value;
        }
        const updated: SharedActivity = {
          users: remainingUsers,
          updatedAt: Date.now(),
        };
        await setShared({
          key: SHARED_KEY,
          body: { value: JSON.stringify(updated), validUntilTime: SHARED_TTL },
        });
        try {
          await refetch();
        } catch {
          // ignore
        }
      } catch {
        // surfaced via `error`; localStorage cleanup still runs below
      }
      try {
        window.localStorage.removeItem(fallbackKey(email));
      } catch {
        // ignore
      }
    },
    [refetch, setShared]
  );

  const effectiveError = isMissingKeyError(error, errorDetails) ? null : error ?? null;

  return {
    users,
    stats,
    isLoading,
    error: effectiveError,
    refresh,
    resetUser,
  };
};
