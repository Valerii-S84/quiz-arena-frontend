/* @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicHomeQuizTeaserWidget } from "./_components/quiz-teaser-widget";
import { CURATED_QUIZ_DAYS } from "./_components/quiz-teaser-questions";
import {
  createEmptyQuizTeaserProgress,
  getLocalDateKey,
  parseQuizTeaserProgress,
  QUIZ_TEASER_PROGRESS_STORAGE_KEY,
  type QuizTeaserProgress,
} from "./_components/quiz-teaser-progress";

const trackEventSpy = vi.fn();

vi.mock("@/app/analytics-provider", () => ({
  usePublicAnalytics: () => ({ trackEvent: trackEventSpy }),
}));

function renderInContainer(ui: JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

async function renderWidget() {
  const rendered = renderInContainer(
    <PublicHomeQuizTeaserWidget trackedTelegramBotUrl="https://t.me/quiz_bot?start=site_public_home" />,
  );
  await act(async () => Promise.resolve());
  return rendered;
}

function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find((item) =>
    item.textContent?.includes(label),
  );
  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
}

function saveProgress(progress: QuizTeaserProgress) {
  window.localStorage.setItem(QUIZ_TEASER_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function oldResultProgress(completedCuratedDays: number): QuizTeaserProgress {
  return {
    version: 1,
    completedCuratedDays,
    activeRound: null,
    lastResult: {
      date: "2000-01-01",
      score: 4,
      source: completedCuratedDays >= 5 ? "api" : "curated",
      dayNumber: Math.max(1, completedCuratedDays),
    },
  };
}

function mockApiQuestion(index: number) {
  return {
    question: {
      id: `api-question-${index}`,
      prompt: `Was passt in API-Satz ${index}?`,
      answers: [
        { id: `api-a-${index}`, label: "Antwort A" },
        { id: `api-b-${index}`, label: "Antwort B" },
      ],
      correctAnswerId: `api-a-${index}`,
      explanation: "Kurze Erklärung.",
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
  window.localStorage.clear();
  vi.restoreAllMocks();
  trackEventSpy.mockClear();
});

describe("public quiz teaser widget", () => {
  it("runs the first curated day without API calls and shows the score on the fifth answer", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    const { container, cleanup } = await renderWidget();

    try {
      expect(container.textContent).toContain("Tag 1 von 5");
      expect(container.textContent).toContain("Sicher durch den Alltag");

      act(() => findButton(container, "Heutige Runde starten").click());

      const firstQuestionLabels = Array.from(container.querySelectorAll("button"))
        .map((button) => button.textContent?.trim())
        .filter((label): label is string => Boolean(label));
      expect(firstQuestionLabels.slice(0, 4)).toEqual([
        CURATED_QUIZ_DAYS[0].questions[0].answers[1].label,
        CURATED_QUIZ_DAYS[0].questions[0].answers[2].label,
        CURATED_QUIZ_DAYS[0].questions[0].answers[3].label,
        CURATED_QUIZ_DAYS[0].questions[0].answers[0].label,
      ]);

      for (const [index, question] of CURATED_QUIZ_DAYS[0].questions.entries()) {
        expect(container.textContent).toContain(question.prompt);
        const correctLabel = question.answers.find(
          (answer) => answer.id === question.correctAnswerId,
        )?.label;
        expect(correctLabel).toBeTruthy();

        act(() => findButton(container, correctLabel ?? "").click());
        expect(container.textContent).toContain(question.explanation);
        expect(container.textContent).not.toContain("Ergebnis anzeigen");

        if (index < 4) {
          act(() => findButton(container, "Nächste Frage").click());
        }
      }

      expect(container.textContent).toContain("Tag 1 geschafft");
      expect(container.textContent).toContain("5/5");
      expect(container.textContent).toContain("nächste Runde morgen");
      expect(fetchSpy).not.toHaveBeenCalled();

      const stored = parseQuizTeaserProgress(
        window.localStorage.getItem(QUIZ_TEASER_PROGRESS_STORAGE_KEY),
      );
      expect(stored.completedCuratedDays).toBe(1);
      expect(stored.lastResult?.date).toBe(getLocalDateKey());
      expect(stored.activeRound).toBeNull();
      expect(trackEventSpy).toHaveBeenCalledWith(
        "quiz_teaser_completed",
        expect.objectContaining({ score: 5, day_number: 1, quiz_source: "curated" }),
      );
    } finally {
      cleanup();
    }
  });

  it("keeps a completed day locked after a reload", async () => {
    saveProgress({
      ...createEmptyQuizTeaserProgress(),
      completedCuratedDays: 1,
      lastResult: { date: getLocalDateKey(), score: 3, source: "curated", dayNumber: 1 },
    });

    const { container, cleanup } = await renderWidget();
    try {
      expect(container.textContent).toContain("Heute geschafft");
      expect(container.textContent).toContain("3/5");
      expect(container.textContent).toContain("Morgen geht es mit Tag 2");
      expect(container.textContent).not.toContain("Heutige Runde starten");
    } finally {
      cleanup();
    }
  });

  it("resumes an unfinished curated round at the next unanswered question", async () => {
    const firstRender = await renderWidget();
    act(() => findButton(firstRender.container, "Heutige Runde starten").click());
    const firstQuestion = CURATED_QUIZ_DAYS[0].questions[0];
    const firstCorrectAnswer = firstQuestion.answers.find(
      (answer) => answer.id === firstQuestion.correctAnswerId,
    );
    act(() => findButton(firstRender.container, firstCorrectAnswer?.label ?? "").click());
    firstRender.cleanup();

    const secondRender = await renderWidget();
    try {
      expect(secondRender.container.textContent).toContain("Runde fortsetzen");
      act(() => findButton(secondRender.container, "Runde fortsetzen").click());
      expect(secondRender.container.textContent).toContain(
        CURATED_QUIZ_DAYS[0].questions[1].prompt,
      );
      expect(secondRender.container.textContent).toContain("Frage 2 von 5");
    } finally {
      secondRender.cleanup();
    }
  });

  it("starts day two only after the date changes", async () => {
    saveProgress(oldResultProgress(1));
    const { container, cleanup } = await renderWidget();
    try {
      expect(container.textContent).toContain("Tag 2 von 5");
      expect(container.textContent).toContain("Deutsch im Beruf");
    } finally {
      cleanup();
    }
  });

  it("uses the API only after all five curated days are complete", async () => {
    saveProgress(oldResultProgress(5));
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      const callNumber = fetchSpy.mock.calls.length;
      return new Response(JSON.stringify(mockApiQuestion(callNumber)), { status: 200 });
    });
    const { container, cleanup } = await renderWidget();

    try {
      expect(container.textContent).toContain("Neue Tagesrunde");
      await act(async () => {
        findButton(container, "Heutige Runde starten").click();
        await Promise.resolve();
      });

      for (let index = 1; index <= 5; index += 1) {
        expect(container.textContent).toContain(`Was passt in API-Satz ${index}?`);
        act(() => findButton(container, "Antwort A").click());
        if (index < 5) {
          await act(async () => {
            findButton(container, "Nächste Frage").click();
            await Promise.resolve();
          });
        }
      }

      expect(fetchSpy).toHaveBeenCalledTimes(5);
      expect(container.textContent).toContain("Tagesrunde geschafft");
      expect(container.textContent).toContain("5/5");
    } finally {
      cleanup();
    }
  });

  it("shows a clean API quota state after the curated journey", async () => {
    saveProgress(oldResultProgress(5));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "quiz_teaser_quota_exceeded" }), { status: 429 }),
    );
    const { container, cleanup } = await renderWidget();

    try {
      await act(async () => {
        findButton(container, "Heutige Runde starten").click();
        await Promise.resolve();
      });
      expect(container.textContent).toContain("Das Quiz-Limit für heute ist erreicht.");
      expect(trackEventSpy).toHaveBeenCalledWith(
        "quiz_teaser_error",
        expect.objectContaining({ question_index: 1 }),
      );
    } finally {
      cleanup();
    }
  });
});
