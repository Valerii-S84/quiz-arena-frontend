import { describe, expect, it } from "vitest";

import {
  CURATED_QUIZ_DAYS,
  CURATED_QUIZ_DAY_COUNT,
  QUESTIONS_PER_QUIZ_DAY,
} from "./_components/quiz-teaser-questions";

describe("curated five-day quiz table", () => {
  it("contains 25 unique, valid questions with the planned daily level progression", () => {
    expect(CURATED_QUIZ_DAY_COUNT).toBe(5);
    expect(CURATED_QUIZ_DAYS).toHaveLength(5);

    const questions = CURATED_QUIZ_DAYS.flatMap((day) => day.questions);
    expect(questions).toHaveLength(25);
    expect(new Set(questions.map((question) => question.id)).size).toBe(25);
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(25);
    expect(CURATED_QUIZ_DAYS[0].questions[0].answers[2].label).toBe(
      "Ich würde gern einen Tee zu haben, bitte.",
    );

    for (const day of CURATED_QUIZ_DAYS) {
      expect(day.questions).toHaveLength(QUESTIONS_PER_QUIZ_DAY);
      expect(day.questions.map((question) => question.level)).toEqual([
        "A1",
        "A2",
        "B1",
        "B2",
        "B2",
      ]);

      for (const [index, question] of day.questions.entries()) {
        expect(question.day).toBe(day.day);
        expect(question.position).toBe(index + 1);
        expect(question.answers).toHaveLength(4);
        expect(new Set(question.answers.map((answer) => answer.id)).size).toBe(4);
        expect(new Set(question.answers.map((answer) => answer.label)).size).toBe(4);
        expect(question.answers.some((answer) => answer.id === question.correctAnswerId)).toBe(true);
        expect(question.prompt.length).toBeGreaterThan(20);
        expect((question.explanation ?? "").length).toBeGreaterThan(40);
      }
    }
  });
});
