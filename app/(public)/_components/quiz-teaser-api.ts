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
};

export class QuizTeaserApiError extends Error {
  constructor() {
    super("Quiz teaser is unavailable");
    this.name = "QuizTeaserApiError";
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
    throw new QuizTeaserApiError();
  }

  const payload = (await response.json()) as QuizTeaserApiResponse;

  if (!payload.question) {
    throw new QuizTeaserApiError();
  }

  return payload.question;
}
