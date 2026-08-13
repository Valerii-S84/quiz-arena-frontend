import { describe, expect, it } from "vitest";

import { shuffleQuizAnswers } from "./_components/quiz-teaser-answer-order";

describe("quiz answer order", () => {
  it("shuffles a copied array without changing the source", () => {
    const source = ["A", "B", "C", "D"] as const;
    const shuffled = shuffleQuizAnswers(source, () => 0);

    expect(shuffled).toEqual(["B", "C", "D", "A"]);
    expect(source).toEqual(["A", "B", "C", "D"]);
  });

  it("forces a changed order when random swaps would keep the original order", () => {
    expect(shuffleQuizAnswers(["A", "B", "C", "D"], () => 0.999)).toEqual([
      "B",
      "C",
      "D",
      "A",
    ]);
  });
});
