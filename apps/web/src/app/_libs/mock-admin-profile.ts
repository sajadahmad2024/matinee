"use client";

import { useSyncExternalStore } from "react";

/**
 * Mock signed-in admin for the UI-only build — replace with `GET /admin/auth/me` when auth is
 * connected. Name edits persist in this browser so the sidebar and profile page stay in sync.
 */
export interface MockAdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  status: "active";
  createdAt: string;
}

const STORAGE_KEY = "mock-admin-profile";

const DEFAULT_PROFILE: MockAdminProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@maintinee.io",
  roles: ["Super Admin"],
  status: "active",
  createdAt: "2026-01-15T00:00:00.000Z",
};

let current: MockAdminProfile | null = null;
const listeners = new Set<() => void>();

const read = (): MockAdminProfile => {
  if (current) return current;
  current = DEFAULT_PROFILE;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved)
      current = { ...DEFAULT_PROFILE, ...(JSON.parse(saved) as Partial<MockAdminProfile>) };
  } catch {
    // Storage blocked or corrupt — fall back to the default profile.
  }
  return current;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const updateMockAdminName = (name: { firstName: string; lastName: string }) => {
  current = { ...read(), ...name };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ firstName: current.firstName, lastName: current.lastName }),
    );
  } catch {
    // Not persisted; the change still applies for this session.
  }
  listeners.forEach((listener) => listener());
};

export const useMockAdminProfile = () =>
  useSyncExternalStore(subscribe, read, () => DEFAULT_PROFILE);

export const getAdminDisplayName = (profile: MockAdminProfile) =>
  [profile?.firstName?.trim(), profile?.lastName?.trim()].filter(Boolean).join(" ") || "Admin";

export const getAdminInitials = (profile: MockAdminProfile) =>
  `${profile?.firstName?.trim()?.charAt(0) ?? ""}${profile?.lastName?.trim()?.charAt(0) ?? ""}`.toUpperCase() ||
  "A";
