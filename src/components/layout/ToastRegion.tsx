"use client";

import { Toast } from "@heroui/react";

/** Región global de toasts, montada una vez en el AppShell. Usar `toast(...)` desde cualquier lugar. */
export function ToastRegion() {
  return <Toast.Provider placement="top end" />;
}
