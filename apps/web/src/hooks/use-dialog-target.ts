"use client";

import { useCallback, useState } from "react";

/**
 * Open/close state for a dialog that acts on one item (a row's "View", "Delete"…).
 *
 * The item outlives `open`, so the dialog stays mounted while it animates closed. Rendering it
 * as `{item && <Dialog open />}` instead unmounts it mid-close — opened from a dropdown menu,
 * that leaves Radix's `pointer-events: none` on `<body>` and the page stops taking clicks.
 */
export function useDialogTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((item: T) => {
    setTarget(item);
    setOpen(true);
  }, []);

  return { target, open, show, onOpenChange: setOpen };
}
