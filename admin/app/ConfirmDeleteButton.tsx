"use client";

import { useTransition } from "react";

type FormDataRecord = Record<string, string>;

export function ConfirmDeleteButton({
  action,
  formData: formDataRecord,
  children = "Ta bort",
  confirmMessage = "Är du säker?",
  style,
}: {
  action: (formData: FormData) => Promise<void>;
  formData: FormDataRecord;
  children?: React.ReactNode;
  confirmMessage?: string;
  style?: React.CSSProperties;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    const fd = new FormData();
    Object.entries(formDataRecord).forEach(([k, v]) => fd.set(k, String(v)));
    startTransition(() => action(fd));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      style={style}
    >
      {isPending ? "…" : children}
    </button>
  );
}
