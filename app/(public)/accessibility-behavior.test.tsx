/* @vitest-environment jsdom */

import { type ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminLoginPage from "../(admin)/admin/login/page";
import { StudentWizard } from "./_components/contact-wizard-student";
import { PartnerWizard } from "./_components/contact-wizard-partner";
import { api } from "@/lib/api";
import type { PublicAnalyticsPayload } from "@/lib/analytics";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

const trackEventSpy = vi.fn();

vi.mock("@/app/analytics-provider", () => ({
  usePublicAnalytics: () => ({
    consent: "granted",
    requestConsent: vi.fn(),
    trackEvent: (name: string, payload: PublicAnalyticsPayload) => trackEventSpy(name, payload),
  }),
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

async function flushEffects(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
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

async function clickByTextAndFlush(container: HTMLElement, expectedText: string): Promise<void> {
  clickByText(container, expectedText);
  await flushEffects();
}

function setValueById(container: HTMLElement, id: string, value: string): void {
  const element = container.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!element) {
    throw new Error(`Input with id "${id}" not found`);
  }

  act(() => {
    const valueSetter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value")?.set;
    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  });
}

async function setValueByIdAndFlush(container: HTMLElement, id: string, value: string): Promise<void> {
  setValueById(container, id, value);
  await flushEffects();
}

function clickOptionByText(container: HTMLElement, expectedText: string): void {
  const button = Array.from(container.querySelectorAll("button")).find((candidate) =>
    candidate.textContent?.includes(expectedText),
  );
  if (!button) {
    throw new Error(`Option button with text containing "${expectedText}" not found`);
  }

  act(() => {
    button.click();
  });
}

async function clickOptionByTextAndFlush(container: HTMLElement, expectedText: string): Promise<void> {
  clickOptionByText(container, expectedText);
  await flushEffects();
}

function clickOptionByFieldsetIndex(
  container: HTMLElement,
  fieldsetId: string,
  optionIndex: number,
): void {
  const fieldset = container.querySelector(`#${fieldsetId}`);
  if (!fieldset) {
    throw new Error(`Fieldset with id "${fieldsetId}" not found`);
  }

  const option = Array.from(fieldset.querySelectorAll("button[type='button']"))[optionIndex];
  if (!option) {
    throw new Error(`Option ${optionIndex} not found in fieldset "${fieldsetId}"`);
  }

  act(() => {
    option.click();
  });
}

async function clickOptionByFieldsetIndexAndFlush(
  container: HTMLElement,
  fieldsetId: string,
  optionIndex: number,
): Promise<void> {
  clickOptionByFieldsetIndex(container, fieldsetId, optionIndex);
  await flushEffects();
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
  trackEventSpy.mockClear();
});

describe("student wizard a11y behavior", () => {
  it("moves focus to first invalid field on first step validation failure", async () => {
    const { container, cleanup } = renderInContainer(<StudentWizard onClose={vi.fn()} />);

    try {
      await clickByTextAndFlush(container, "Weiter");

      expect((container.querySelector("#student-form-error")?.textContent ?? "")).toContain(
        "Bitte gib deinen Namen ein.",
      );
      expect(document.activeElement?.id).toBe("student-name");
    } finally {
      cleanup();
    }
  });

});

describe("lead analytics behavior", () => {
  it("tracks student lead_submit_success after successful submit", async () => {
    const { container, cleanup } = renderInContainer(<StudentWizard onClose={vi.fn()} />);

    try {
      await setValueByIdAndFlush(container, "student-name", "Anna Test");
      await clickOptionByFieldsetIndexAndFlush(container, "student-age-group", 0);
      await clickOptionByFieldsetIndexAndFlush(container, "student-level", 0);
      await clickOptionByFieldsetIndexAndFlush(container, "student-goals", 0);
      await clickByTextAndFlush(container, "Weiter");

      await clickOptionByFieldsetIndexAndFlush(container, "student-format", 0);
      await clickOptionByFieldsetIndexAndFlush(container, "student-time", 0);
      await clickOptionByFieldsetIndexAndFlush(container, "student-frequency", 0);
      await clickByTextAndFlush(container, "Weiter");

      await setValueByIdAndFlush(container, "student-contact", "anna@example.com");
      await clickByTextAndFlush(container, "Anfrage senden →");

      expect(trackEventSpy).toHaveBeenCalledWith(
        "lead_submit_success",
        expect.objectContaining({
          wizard_type: "student",
          has_contact: true,
          goals_count: 1,
        }),
      );
      expect(trackEventSpy).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
    }
  });

  it("tracks partner lead_submit_success after successful submit", async () => {
    const { container, cleanup } = renderInContainer(<PartnerWizard onClose={vi.fn()} />);

    try {
      await setValueByIdAndFlush(container, "partner-name", "Learn Academy");
      await clickOptionByFieldsetIndexAndFlush(container, "partner-type", 0);
      await setValueByIdAndFlush(container, "partner-country", "Berlin");
      await clickOptionByFieldsetIndexAndFlush(container, "partner-student-count", 0);
      await clickOptionByFieldsetIndexAndFlush(container, "partner-offerings", 0);
      await clickByTextAndFlush(container, "Weiter");

      await setValueByIdAndFlush(container, "partner-contact", "@learn_academy");
      await setValueByIdAndFlush(
        container,
        "partner-idea",
        "Wir möchten Kooperation rund um Prüfungsvorbereitung aufbauen.",
      );
      await clickOptionByTextAndFlush(container, "So schnell wie möglich");
      await clickByTextAndFlush(container, "Vorschlag senden →");

      expect(trackEventSpy).toHaveBeenCalledWith(
        "lead_submit_success",
        expect.objectContaining({
          wizard_type: "partner",
          offerings_count: 1,
          has_contact: true,
          has_website: false,
        }),
      );
      expect(trackEventSpy).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
    }
  });
});

describe("partner wizard a11y behavior", () => {
  it("moves focus to first invalid field when trying to advance", async () => {
    const { container, cleanup } = renderInContainer(<PartnerWizard onClose={vi.fn()} />);

    try {
      await clickByTextAndFlush(container, "Weiter");

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
