import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock @tauri-apps/api/core — used by booth-api.ts, UpdateToast.tsx
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock @tauri-apps/api/event — used by App.tsx
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
  emit: vi.fn(),
}));

// Mock @tauri-apps/plugin-http — used by booth-api.ts
vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: vi.fn(),
}));

// Mock @tauri-apps/plugin-shell — used by ItemDetailPage.tsx
vi.mock('@tauri-apps/plugin-shell', () => ({
  open: vi.fn(),
}));
