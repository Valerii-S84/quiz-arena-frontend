export type QuizTeaserAnswer = {
  id: string;
  label: string;
};

export type QuizTeaserQuestion = {
  id: string;
  prompt: string;
  answers: QuizTeaserAnswer[];
  correctAnswerId: string;
  explanation?: string;
};

type QuizTeaserApiResponse = {
  question?: QuizTeaserQuestion;
  error?: string;
};

export class QuizTeaserApiError extends Error {
  code: string;

  constructor(code = "quiz_teaser_unavailable") {
    super("Quiz teaser is unavailable");
    this.name = "QuizTeaserApiError";
    this.code = code;
  }
}

export async function fetchQuizTeaserQuestion(
  answeredQuestionIds: string[],
  signal?: AbortSignal,
): Promise<QuizTeaserQuestion> {
  const response = await fetch("/api/quiz-teaser/next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answeredQuestionIds }),
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as QuizTeaserApiResponse;
    throw new QuizTeaserApiError(payload.error);
  }

  const payload = (await response.json()) as QuizTeaserApiResponse;

  if (!payload.question) {
    throw new QuizTeaserApiError();
  }

  return payload.question;
}
