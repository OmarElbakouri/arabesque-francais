// Keep an uncertain start across refreshes so retrying can recover the server's session.
const attempts = new Map<string, string>();

export function quizStartScope(accountId: string, group: number, chapters?: number[]): string {
  return `bclt:quiz-start:${encodeURIComponent(accountId)}:${group}:${[...new Set(chapters || [])].sort((a, b) => a - b).join(',')}`;
}

export function pendingQuizStartId(scope: string): string | undefined {
  try {
    const saved = sessionStorage.getItem(scope);
    if (saved) attempts.set(scope, saved);
  } catch {
    // Private browsing or full storage must not prevent starting a quiz.
  }
  return attempts.get(scope);
}

export function quizStartRequestId(scope: string): string {
  const pending = pendingQuizStartId(scope);
  if (pending) return pending;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  attempts.set(scope, id);
  try { sessionStorage.setItem(scope, id); } catch { /* Use the in-memory ID. */ }
  return id;
}

export function clearQuizStartId(scope: string, id: string): void {
  if (pendingQuizStartId(scope) !== id) return;
  attempts.delete(scope);
  try { sessionStorage.removeItem(scope); } catch { /* Storage is unavailable. */ }
}

export function getQuizStartErrorMessage(error: unknown): string {
  const err = error as { code?: string; isAxiosError?: boolean; message?: string;
    response?: { status?: number; data?: { message?: string } } } | null;
  const status = err?.response?.status;
  const backendMessage = typeof err?.response?.data?.message === 'string'
    ? err.response.data.message.trim() : '';

  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT' || status === 504) {
    return 'La préparation du quiz prend trop de temps. Réessayez pour récupérer votre quiz.';
  }
  if (status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
  if (status === 403) return backendMessage || 'Votre accès au quiz a été refusé. Reconnectez-vous puis réessayez.';
  if (status === 429) return backendMessage || 'Limite quotidienne atteinte. Réessayez demain.';
  if (status === 502 || status === 503) {
    return backendMessage || 'Le service des quiz est temporairement indisponible. Veuillez réessayer.';
  }
  if (backendMessage) return backendMessage;
  if (err?.isAxiosError && !err.response) {
    return 'Connexion au serveur interrompue. Vérifiez votre connexion Internet puis réessayez.';
  }
  if (error instanceof Error && !err?.isAxiosError) return error.message;
  return 'Impossible de préparer le quiz pour le moment. Veuillez réessayer.';
}
