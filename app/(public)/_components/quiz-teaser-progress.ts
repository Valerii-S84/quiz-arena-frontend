import type { QuizTeaserQuestion } from "./quiz-teaser-api";
import { CURATED_QUIZ_DAY_COUNT, QUESTIONS_PER_QUIZ_DAY } from "./quiz-teaser-questions";

export const QUIZ_TEASER_PROGRESS_STORAGE_KEY = "quiz_arena_five_question_progress_v1";

export type QuizTeaserSource = "curated" | "api";

export type ActiveQuizTeaserRound = {
  source: QuizTeaserSource;
  dayIndex: number;
  questionIndex: number;
  score: number;
  answeredQuestionIds: string[];
  apiQuestion?: QuizTeaserQuestion;
};

export type QuizTeaserResult = {
  date: string;
  score: number;
  source: QuizTeaserSource;
  dayNumber: number;
};

export type QuizTeaserProgress = {
  version: 1;
  completedCuratedDays: number;
  completedBonusRounds: number;
  activeRound: ActiveQuizTeaserRound | null;
  lastResult: QuizTeaserResult | null;
};

export function createEmptyQuizTeaserProgress(): QuizTeaserProgress {
  return {
    version: 1,
    completedCuratedDays: 0,
    completedBonusRounds: 0,
    activeRound: null,
    lastResult: null,
  };
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isQuizQuestion(value: unknown): value is QuizTeaserQuestion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const question = value as Partial<QuizTeaserQuestion>;
  return (
    typeof question.id === "string" &&
    typeof question.prompt === "string" &&
    Array.isArray(question.answers) &&
    question.answers.length >= 2 &&
    question.answers.every(
      (answer) =>
        answer &&
        typeof answer === "object" &&
        typeof answer.id === "string" &&
        typeof answer.label === "string",
    ) &&
    typeof question.correctAnswerId === "string"
  );
}

function normalizeActiveRound(
  value: unknown,
  completedCuratedDays: number,
  completedBonusRounds: number,
): ActiveQuizTeaserRound | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const round = value as Partial<ActiveQuizTeaserRound>;
  const source = round.source === "curated" || round.source === "api" ? round.source : null;
  const questionIndex = Number.isInteger(round.questionIndex)
    ? Number(round.questionIndex)
    : -1;
  const score = Number.isInteger(round.score) ? Number(round.score) : -1;
  const storedDayIndex = Number.isInteger(round.dayIndex) ? Number(round.dayIndex) : -1;
  const answeredQuestionIds = Array.isArray(round.answeredQuestionIds)
    ? round.answeredQuestionIds.filter((id): id is string => typeof id === "string")
    : [];

  if (
    !source ||
    questionIndex < 0 ||
    questionIndex >= QUESTIONS_PER_QUIZ_DAY ||
    score < 0 ||
    score > questionIndex ||
    answeredQuestionIds.length !== questionIndex
  ) {
    return null;
  }

  if (source === "curated" && completedCuratedDays >= CURATED_QUIZ_DAY_COUNT) {
    return null;
  }

  if (source === "api" && completedCuratedDays < CURATED_QUIZ_DAY_COUNT) {
    return null;
  }

  return {
    source,
    dayIndex:
      source === "curated"
        ? completedCuratedDays
        : Math.max(CURATED_QUIZ_DAY_COUNT + completedBonusRounds, storedDayIndex),
    questionIndex,
    score,
    answeredQuestionIds,
    ...(source === "api" && isQuizQuestion(round.apiQuestion)
      ? { apiQuestion: round.apiQuestion }
      : {}),
  };
}

function normalizeLastResult(value: unknown): QuizTeaserResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const result = value as Partial<QuizTeaserResult>;
  if (
    typeof result.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(result.date) ||
    !Number.isInteger(result.score) ||
    Number(result.score) < 0 ||
    Number(result.score) > QUESTIONS_PER_QUIZ_DAY ||
    (result.source !== "curated" && result.source !== "api") ||
    !Number.isInteger(result.dayNumber) ||
    Number(result.dayNumber) < 1
  ) {
    return null;
  }

  return {
    date: result.date,
    score: Number(result.score),
    source: result.source,
    dayNumber: Number(result.dayNumber),
  };
}

export function parseQuizTeaserProgress(rawValue: string | null): QuizTeaserProgress {
  if (!rawValue) {
    return createEmptyQuizTeaserProgress();
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<QuizTeaserProgress>;
    const completedCuratedDays = Math.min(
      CURATED_QUIZ_DAY_COUNT,
      Math.max(
        0,
        Number.isInteger(parsed.completedCuratedDays)
          ? Number(parsed.completedCuratedDays)
          : 0,
      ),
    );

    const lastResult = normalizeLastResult(parsed.lastResult);
    const legacyCompletedBonusRounds =
      lastResult?.source === "api"
        ? Math.max(0, lastResult.dayNumber - CURATED_QUIZ_DAY_COUNT)
        : 0;
    const completedBonusRounds = Math.max(
      legacyCompletedBonusRounds,
      Number.isInteger(parsed.completedBonusRounds)
        ? Math.max(0, Number(parsed.completedBonusRounds))
        : 0,
    );

    return {
      version: 1,
      completedCuratedDays,
      completedBonusRounds,
      activeRound: normalizeActiveRound(
        parsed.activeRound,
        completedCuratedDays,
        completedBonusRounds,
      ),
      lastResult,
    };
  } catch {
    return createEmptyQuizTeaserProgress();
  }
}

export function loadQuizTeaserProgress(): QuizTeaserProgress {
  if (typeof window === "undefined") {
    return createEmptyQuizTeaserProgress();
  }

  try {
    return parseQuizTeaserProgress(window.localStorage.getItem(QUIZ_TEASER_PROGRESS_STORAGE_KEY));
  } catch {
    return createEmptyQuizTeaserProgress();
  }
}

export function saveQuizTeaserProgress(progress: QuizTeaserProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(QUIZ_TEASER_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The quiz remains usable when storage is blocked; only cross-visit progress is unavailable.
  }
}

export function isQuizCompletedToday(
  progress: QuizTeaserProgress,
  date = new Date(),
): boolean {
  return progress.lastResult?.date === getLocalDateKey(date);
}
