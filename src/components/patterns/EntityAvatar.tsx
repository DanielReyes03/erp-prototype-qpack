"use client";

import { Avatar } from "@heroui/react";

const COLORS = ["accent", "success", "warning", "danger", "default"] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function hashColor(name: string): (typeof COLORS)[number] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

interface EntityAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

/** Avatar circular con iniciales, color estable derivado del nombre. */
export function EntityAvatar({ name, size = "sm" }: EntityAvatarProps) {
  return (
    <Avatar size={size} color={hashColor(name)} variant="soft">
      <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
    </Avatar>
  );
}
