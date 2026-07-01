export const API = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8080/api`;
export const WS_BASE = import.meta.env.VITE_WS_URL ?? `ws://${window.location.hostname}:8080/ws`;
