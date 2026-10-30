export const AUTH_STATE_EVENT = "folio:auth-state-change";

export function notifyAuthStateChange() {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}
