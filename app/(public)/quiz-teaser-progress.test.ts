import { describe, expect, it } from "vitest";

import { parseQuizTeaserProgress } from "./_components/quiz-teaser-progress";

describe("quiz teaser progress migration", () => {
  it("derives the bonus counter from a legacy API result", () => {
    const progress = parseQuizTeaserProgress(
      JSON.stringify({
        version: 1,
        completedCuratedDays: 5,
        activeRound: null,
        lastResult: {
          date: "2026-08-12",
          score: 4,
          source: "api",
          dayNumber: 6,
        },
      }),
    );

    expect(progress.completedBonusRounds).toBe(1);
  });
});
