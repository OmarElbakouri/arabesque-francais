import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

type Pending = { path: string; body: Record<string, unknown>; requestId: string };
const flights = new Map<string, Promise<any>>();
const memory = new Map<string, Pending>();
function key(feature: string): string {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Veuillez vous reconnecter.');
  return `bclt:ai-request:${id}:${feature}`;
}
export function pendingAiRequest(feature: string): Pending | null {
  const scope = key(feature);
  try { const value = sessionStorage.getItem(scope); if (value) return JSON.parse(value); } catch { /* memory fallback */ }
  return memory.get(scope) || null;
}
function clear(scope: string) {
  memory.delete(scope);
  try { sessionStorage.removeItem(scope); } catch { /* memory fallback */ }
}

/** Retain the original payload and key across timeout, retry and page refresh. */
export function postAiOnce(feature: string, path: string, body: Record<string, unknown>): Promise<any> {
  const scope = key(feature);
  let pending = pendingAiRequest(feature);
  if (pending && (pending.path !== path || JSON.stringify(pending.body) !== JSON.stringify(body))) {
    return Promise.reject(new Error('Reprenez d’abord la demande en attente, sans nouveau débit.'));
  }
  const active = flights.get(scope);
  if (active) return active;
  pending ||= { path, body, requestId: crypto.randomUUID() };
  memory.set(scope, pending);
  try { sessionStorage.setItem(scope, JSON.stringify(pending)); } catch { /* memory fallback */ }
  const attempt = api.post(path, { ...pending.body, requestId: pending.requestId }).then(response => {
    if (!response.data?.success || !response.data?.data || response.data?.data?.status === 'error') {
      throw new Error(response.data?.data?.reply || response.data?.message || 'Réessayez la même demande.');
    }
    clear(scope);
    return response;
  }).catch(error => {
    if ([400, 401, 403, 410, 413, 422, 429].includes(error.response?.status)) clear(scope);
    throw error;
  }).finally(() => flights.delete(scope));
  flights.set(scope, attempt);
  return attempt;
}

export function retryPendingAi(feature: string): Promise<any> | null {
  const pending = pendingAiRequest(feature);
  return pending ? postAiOnce(feature, pending.path, pending.body) : null;
}

export function clearPendingAi(feature: string): void { clear(key(feature)); }
