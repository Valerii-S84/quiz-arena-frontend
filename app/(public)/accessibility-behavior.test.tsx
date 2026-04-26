/* @vitest-environment jsdom */

import { type ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminLoginPage from "../(admin)/admin/login/page";
import { StudentWizard } from "./_components/contact-wizard-student";
import { PartnerWizard } from "./_components/contact-wizard-partner";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

type MountedRoot = {
  container: HTMLDivElement;
  cleanup: () => void;
};

function renderInContainer(ui: ReactElement): MountedRoot {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(ui);
  });

  return {
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function clickByText(container: HTMLElement, expectedText: string): void {
  const button = Array.from(container.querySelectorAll("button")).find((candidate) =>
    candidate.textContent?.includes(expectedText),
  );
  if (!button) {
    throw new Error(`Button with text containing "${expectedText}" not found`);
  }

  act(() => {
    button.click();
  });
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

describe("student wizard a11y behavior", () => {
  it("moves focus to first invalid field on first step validation failure", async () => {
    const { container, cleanup } = renderInContainer(<StudentWizard onClose={vi.fn()} />);

    try {
      clickByText(container, "Weiter");
      await act(async () => {
        await Promise.resolve();
      });

      expect((container.querySelector("#student-form-error")?.textContent ?? "")).toContain(
        "Bitte gib deinen Namen ein.",
      );
      expect(document.activeElement?.id).toBe("student-name");
    } finally {
      cleanup();
    }
  });

});

describe("partner wizard a11y behavior", () => {
  it("moves focus to first invalid field when trying to advance", async () => {
    const { container, cleanup } = renderInContainer(<PartnerWizard onClose={vi.fn()} />);

    try {
      clickByText(container, "Weiter");
      await act(async () => {
        await Promise.resolve();
      });

      expect((container.querySelector("#partner-form-error")?.textContent ?? "")).toContain(
        "Bitte gib deinen Namen oder den Organisationsnamen ein.",
      );
      expect(document.activeElement?.id).toBe("partner-name");
    } finally {
      cleanup();
    }
  });
});

describe("admin login a11y behavior", () => {
  it("returns focus to admin-email on first RHF validation failure", async () => {
    const { container, cleanup } = renderInContainer(<AdminLoginPage />);

    try {
      clickByText(container, "Sign In");

      await act(async () => {
        await Promise.resolve();
      });

      const email = document.getElementById("admin-email");
      expect(email).not.toBeNull();
      expect(document.activeElement).toBe(email);
      expect(api.post).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });
});
