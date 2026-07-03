"use client";

import { useEffect, useState } from "react";

/** Returns true once mounted on the client — guards browser-only UI. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
