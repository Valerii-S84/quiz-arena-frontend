"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ReactNode } from "react";

export type WizardKind = "student" | "partner";
export type SubmitState = "idle" | "loading" | "success" | "error";

export type WizardProps = {
  onClose: () => void;
};

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
};

type WizardModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  open: boolean;
};

export const SELECT_BASE_CLASS =
  "min-w-0 rounded-xl border border-white/60 bg-white/70 p-3 text-left transition hover:border-sky-300 hover:bg-white";

export const SELECT_ACTIVE_CLASS =
  "border-sky-500 bg-sky-50 shadow-[0_8px_24px_rgba(2,132,199,0.15)]";

export const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export function toggleInList(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }
  return [...values, value];
}

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
        Schritt {current} von {total}
      </p>
      <div className="mt-2 flex gap-2">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const isActive = step <= current;
          return (
            <span
              key={step}
              className={`h-2 flex-1 rounded-full ${isActive ? "bg-sky-500" : "bg-slate-200"}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ChoiceCards({
  options,
  value,
  onChange,
  columnsClass = "grid-cols-1 sm:grid-cols-2",
}: {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  columnsClass?: string;
}) {
  return (
    <div className={`grid min-w-0 gap-2 ${columnsClass}`}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`${SELECT_BASE_CLASS} ${isActive ? SELECT_ACTIVE_CLASS : ""}`}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            <span className="block min-w-0 break-words text-sm font-medium leading-snug text-slate-800">
              {option.icon ? `${option.icon} ` : ""}
              {option.label}
            </span>
            {option.description ? (
              <span className="mt-1 block text-xs text-slate-600">{option.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function MultiChoiceCards({
  options,
  values,
  onToggle,
  columnsClass = "grid-cols-1 sm:grid-cols-2",
}: {
  options: ChoiceOption[];
  values: string[];
  onToggle: (value: string) => void;
  columnsClass?: string;
}) {
  return (
    <div className={`grid min-w-0 gap-2 ${columnsClass}`}>
      {options.map((option) => {
        const isActive = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={`${SELECT_BASE_CLASS} ${isActive ? SELECT_ACTIVE_CLASS : ""}`}
            aria-pressed={isActive}
            onClick={() => onToggle(option.value)}
          >
            <span className="block min-w-0 break-words text-sm font-medium leading-snug text-slate-800">
              {isActive ? "☑ " : "☐ "}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

export function HoneypotField({
  fieldId,
  value,
  onChange,
}: {
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={fieldId}>Website</label>
      <input
        id={fieldId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
}

export function WizardModal({ title, onClose, children, open }: WizardModalProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[59] overflow-y-auto bg-white/35 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
          <Dialog.Content
            className="relative mx-auto flex min-h-full w-full max-w-[560px] items-center justify-center"
          >
            <div className="max-h-[calc(100svh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-white/50 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:max-h-[calc(100svh-3rem)] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <Dialog.Title className="min-w-0 break-words text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Dialog zum Ausfüllen des Kontaktformulars. Zum Schließen Esc oder Schaltfläche schließen.
                </Dialog.Description>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-full px-2 py-1 text-lg leading-none text-slate-600 transition hover:bg-slate-100"
                    aria-label="Schließen"
                  >
                    ✕
                  </button>
                </Dialog.Close>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                Personenbezogene Daten aus dem Formular werden nur zur Bearbeitung deiner Anfrage
                verarbeitet. Details findest du in{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  Datenschutz
                </Link>{" "}
                und{" "}
                <Link href="/impressum" className="underline underline-offset-2">
                  Impressum
                </Link>
                .
              </p>
              <div className="mt-4 min-w-0">{children}</div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
