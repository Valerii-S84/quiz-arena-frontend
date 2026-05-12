/* @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicHomeQuizTeaserWidget } from "./_components/quiz-teaser-widget";

const trackEventSpy = vi.fn();

vi.mock("@/app/analytics-provider", () => ({
  usePublicAnalytics: () => ({
    trackEvent: trackEventSpy,
  }),
}));

function renderInContainer(ui: JSX.Element) {
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

function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find((item) =>
    item.textContent?.includes(label),
  );

  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
}

function mockQuestion(index: number) {
  return {
    question: {
      id: `question-${index}`,
      prompt: `Was passt in Satz ${index}?`,
      answers: [
        { id: `a-${index}`, label: "Antwort A" },
        { id: `b-${index}`, label: "Antwort B" },
      ],
      correctAnswerId: `a-${index}`,
      explanation: "Kurze Erklärung.",
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  trackEventSpy.mockClear();
});

describe("public quiz teaser widget", () => {
  it("renders a clean error state when the local teaser route fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "unavailable" }), { status: 503 }),
    );

    const { container, cleanup } = renderInContainer(
      <PublicHomeQuizTeaserWidget trackedTelegramBotUrl="https://t.me/quiz_bot" />,
    );

    try {
      await act(async () => {
        findButton(container, "Quiz starten").click();
        await Promise.resolve();
      });

      expect(container.textContent).toContain(
        "Das Quiz ist gerade nicht verfügbar. Bitte versuche es später erneut.",
      );
      expect(trackEventSpy).toHaveBeenCalledWith(
        "quiz_teaser_error",
        expect.objectContaining({ section: "quiz_teaser", question_index: 1 }),
      );
    } finally {
      cleanup();
    }
  });

  it("runs five questions, shows the final score, and exposes the Telegram CTA", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      const callNumber = fetchSpy.mock.calls.length;
      return new Response(JSON.stringify(mockQuestion(callNumber)), { status: 200 });
    });

    const { container, cleanup } = renderInContainer(
      <PublicHomeQuizTeaserWidget trackedTelegramBotUrl="https://t.me/quiz_bot?start=site_public_home" />,
    );

    try {
      await act(async () => {
        findButton(container, "Quiz starten").click();
        await Promise.resolve();
      });

      for (let index = 1; index <= 5; index += 1) {
        expect(container.textContent).toContain(`Frage ${index} von 5`);
        expect(container.textContent).toContain(`Was passt in Satz ${index}?`);

        await act(async () => {
          findButton(container, "Antwort A").click();
          await Promise.resolve();
        });

        await act(async () => {
          findButton(container, index === 5 ? "Ergebnis anzeigen" : "Nächste Frage").click();
          await Promise.resolve();
        });
      }

      expect(container.textContent).toContain("Dein Ergebnis: 5/5");
      const telegramCta = container.querySelector<HTMLAnchorElement>(
        'a[href="https://t.me/quiz_bot?start=site_public_home"]',
      );
      expect(telegramCta?.textContent).toContain("Im Telegram-Bot weitermachen");

      await act(async () => {
        telegramCta?.click();
        await Promise.resolve();
      });

      expect(trackEventSpy).toHaveBeenCalledWith(
        "quiz_teaser_started",
        expect.objectContaining({ section: "quiz_teaser" }),
      );
      expect(trackEventSpy).toHaveBeenCalledWith(
        "quiz_teaser_completed",
        expect.objectContaining({ section: "quiz_teaser", score: 5 }),
      );
      expect(trackEventSpy).toHaveBeenCalledWith(
        "quiz_teaser_cta_clicked",
        expect.objectContaining({
          section: "quiz_teaser",
          score: 5,
          destination: "telegram_bot",
        }),
      );
    } finally {
      cleanup();
    }
  });
});
