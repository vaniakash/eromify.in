"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export function UserSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset to page 1
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
      <span
        className="material-symbols-outlined"
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 18,
          color: "var(--text-muted)",
          pointerEvents: "none",
        }}
      >
        search
      </span>
      <input
        type="search"
        placeholder="Search by name or email…"
        defaultValue={defaultValue}
        onChange={handleChange}
        style={{
          width: "100%",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          padding: "9px 14px 9px 40px",
          fontSize: 13,
          color: "var(--text-primary)",
          outline: "none",
          fontFamily: "inherit",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(124,108,254,0.5)";
          e.target.style.boxShadow = "0 0 0 3px rgba(124,108,254,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border-subtle)";
          e.target.style.boxShadow = "none";
        }}
      />
      {isPending && (
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            border: "2px solid rgba(124,108,254,0.3)",
            borderTopColor: "var(--accent-violet)",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
}
