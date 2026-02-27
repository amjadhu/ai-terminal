"use client";

import { useServerSync } from "@/hooks/useServerSync";

export function SessionSync() {
  useServerSync();
  return null;
}
