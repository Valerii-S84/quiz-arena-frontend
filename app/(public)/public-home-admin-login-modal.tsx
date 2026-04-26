import * as Dialog from "@radix-ui/react-dialog";
import type { FormEvent } from "react";

import { INPUT_CLASS } from "./public-home-content";
import type { FormStatus } from "./public-home-types";

type PublicHomeAdminLoginModalProps = {
  isOpen: boolean;
  loginValue: string;
  passwordValue: string;
  loginStatus: FormStatus;
  loginFeedback: string | null;
  onClose: () => void;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PublicHomeAdminLoginModal({
  isOpen,
  loginValue,
  passwordValue,
  loginStatus,
  loginFeedback,
  onClose,
  onLoginChange,
  onPasswordChange,
  onSubmit,
}: PublicHomeAdminLoginModalProps) {
  if (!isOpen) {
    return null;
  }

  const loginInputId = "admin-login-login";
  const passwordInputId = "admin-login-password";
  const errorId = "admin-login-feedback";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm">
          <Dialog.Content className="w-full max-w-sm rounded-2xl border border-white/50 bg-white/85 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <Dialog.Title className="text-2xl font-semibold">Admin Login</Dialog.Title>
              <Dialog.Description className="sr-only">
                Admin Login Formular. Bitte Login und Passwort eingeben.
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

            <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
              <div>
                <label
                  htmlFor={loginInputId}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Login
                </label>
                <input
                  id={loginInputId}
                  type="text"
                  className={INPUT_CLASS}
                  value={loginValue}
                  onChange={(event) => onLoginChange(event.target.value)}
                  autoComplete="username"
                  required
                  aria-required="true"
                  aria-describedby={loginFeedback ? errorId : undefined}
                  aria-invalid={Boolean(loginFeedback && loginFeedback.length)}
                  placeholder="Login"
                />
              </div>

              <div>
                <label
                  htmlFor={passwordInputId}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Passwort
                </label>
                <input
                  id={passwordInputId}
                  type="password"
                  className={INPUT_CLASS}
                  value={passwordValue}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  aria-describedby={loginFeedback ? errorId : undefined}
                  aria-invalid={Boolean(loginFeedback && loginFeedback.length)}
                  placeholder="Passwort"
                />
              </div>

              <button
                type="submit"
                disabled={loginStatus === "loading"}
                className="w-full rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loginStatus === "loading" ? "Einloggen..." : "Einloggen"}
              </button>
            </form>

            {loginFeedback ? (
              <p
                id={errorId}
                className="mt-3 text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {loginFeedback}
              </p>
            ) : null}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
