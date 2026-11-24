const STORAGE_KEY_PREFIX = "api-fortress-learning-completed-tasks";

/** Sıralı learning path — önceki görev tamamlanmadan sonraki açılmaz */
export const LEARNING_PATH_ORDER = [
  "mass-assignment",
  "auth-bypass",
  "login-logic-flaw",
  "idor-bola",
  "bfla",
] as const;

export function getProgressStorageKey(userKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${userKey}`;
}

export function readCompletedTaskIds(userKey?: string | null): string[] {
  if (!userKey) return [];
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getProgressStorageKey(userKey));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function persistCompletedTaskIds(userKey: string, ids: readonly string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getProgressStorageKey(userKey), JSON.stringify([...ids]));
}

/** Tamamlanan listesine ekler, localStorage’a yazar, yeni diziyi döner */
export function markTaskCompleted(userKey: string, taskId: string): string[] {
  const cur = readCompletedTaskIds(userKey);
  if (cur.includes(taskId)) return cur;
  const next = [...cur, taskId];
  persistCompletedTaskIds(userKey, next);
  return next;
}

export function resetCompletedTaskIds(userKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getProgressStorageKey(userKey));
}

/** İlk görev (mass-assignment) her zaman açık; sonrakiler için bir önceki tamamlanmış olmalı */
export function isTaskUnlocked(taskId: string, completedIds: readonly string[]): boolean {
  const order = LEARNING_PATH_ORDER as readonly string[];
  const idx = order.indexOf(taskId);
  if (idx === -1) return false;
  if (idx === 0) return true;
  return completedIds.includes(order[idx - 1]!);
}

export function isTaskCompleted(taskId: string, completedIds: readonly string[]): boolean {
  return completedIds.includes(taskId);
}

/** localStorage + backend listesini birleştirir, learning path sırasını korur */
export function mergeCompletedWithRemote(
  userKey: string,
  remoteCompleted: readonly string[]
): string[] {
  const local = readCompletedTaskIds(userKey);
  const mergedSet = new Set([...local, ...remoteCompleted]);
  const ordered = LEARNING_PATH_ORDER.filter((id) => mergedSet.has(id));
  const extras = [...mergedSet].filter(
    (id) => !(LEARNING_PATH_ORDER as readonly string[]).includes(id)
  );
  const merged = [...ordered, ...extras];
  persistCompletedTaskIds(userKey, merged);
  return merged;
}
