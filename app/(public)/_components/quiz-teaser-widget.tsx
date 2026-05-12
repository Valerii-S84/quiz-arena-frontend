"use client";

import { useState } from "react";

import { usePublicAnalytics } from "@/app/analytics-provider";
import { ORANGE_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "../public-home-content";
import {
  fetchQuizTeaserQuestion,
  QuizTeaserApiError,
  type QuizTeaserAnswer,
  type QuizTeaserQuestion,
} from "./quiz-teaser-api";

const TOTAL_QUESTIONS = 5;
const SECTION_NAME = "quiz_teaser";
const UNAVAILABLE_MESSAGE =
  "Das Quiz ist gerade nicht verfügbar. Bitte versuche es später erneut.";
const QUOTA_EXCEEDED_MESSAGE =
  "Das Quiz-Limit für heute ist erreicht. Bitte versuche es später erneut oder mache im Telegram-Bot weiter.";

type QuizStage = "start" | "loading" | "question" | "result" | "error";

type PublicHomeQuizTeaserWidgetProps = {
  trackedTelegramBotUrl: string;
};

function getAnswerClass(
  answer: QuizTeaserAnswer,
  selectedAnswerId: string | null,
  correctAnswerId: string,
): string {
  const baseClass =
    "w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-default";

  if (!selectedAnswerId) {
    return `${baseClass} border-white/10 bg-white/[0.06] text-white hover:border-[#2AABEE]/60 hover:bg-[#2AABEE]/10`;
  }

  if (answer.id === correctAnswerId) {
    return `${baseClass} border-[#4DE2C6]/60 bg-[#4DE2C6]/15 text-[#B9FFF2]`;
  }

  if (answer.id === selectedAnswerId) {
    return `${baseClass} border-[#FFD166]/60 bg-[#FFD166]/10 text-[#FFE3A0]`;
  }

  return `${baseClass} border-white/10 bg-white/[0.03] text-slate-400`;
}

export function PublicHomeQuizTeaserWidget({
  trackedTelegramBotUrl,
}: PublicHomeQuizTeaserWidgetProps) {
  const { trackEvent } = usePublicAnalytics();
  const [stage, setStage] = useState<QuizStage>("start");
  const [question, setQuestion] = useState<QuizTeaserQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState(UNAVAILABLE_MESSAGE);

  const loadQuestion = async (nextAnsweredQuestionIds: string[], nextQuestionIndex: number) => {
    setStage("loading");
    setSelectedAnswerId(null);

    try {
      const nextQuestion = await fetchQuizTeaserQuestion(nextAnsweredQuestionIds);
      setQuestion(nextQuestion);
      setQuestionIndex(nextQuestionIndex);
      setStage("question");
    } catch (error) {
      setErrorMessage(
        error instanceof QuizTeaserApiError && error.code === "quiz_teaser_quota_exceeded"
          ? QUOTA_EXCEEDED_MESSAGE
          : UNAVAILABLE_MESSAGE,
      );
      setStage("error");
      trackEvent("quiz_teaser_error", {
        section: SECTION_NAME,
        question_index: nextQuestionIndex,
      });
    }
  };

  const startQuiz = () => {
    setScore(0);
    setQuestion(null);
    setQuestionIndex(1);
    setAnsweredQuestionIds([]);
    setSelectedAnswerId(null);
    setErrorMessage(UNAVAILABLE_MESSAGE);
    trackEvent("quiz_teaser_started", { section: SECTION_NAME, question_index: 0 });
    void loadQuestion([], 1);
  };

  const selectAnswer = (answer: QuizTeaserAnswer) => {
    if (!question || selectedAnswerId) {
      return;
    }

    const isCorrect = answer.id === question.correctAnswerId;
    setSelectedAnswerId(answer.id);

    trackEvent("quiz_teaser_question_answered", {
      section: SECTION_NAME,
      question_index: questionIndex,
      selected_answer_id: answer.id,
      is_correct: isCorrect,
      score: isCorrect ? score + 1 : score,
    });
  };

  const continueQuiz = () => {
    if (!question || !selectedAnswerId) {
      return;
    }

    const nextScore = selectedAnswerId === question.correctAnswerId ? score + 1 : score;
    const nextAnsweredQuestionIds = [...answeredQuestionIds, question.id];
    setAnsweredQuestionIds(nextAnsweredQuestionIds);
    setScore(nextScore);

    if (questionIndex >= TOTAL_QUESTIONS) {
      setStage("result");
      trackEvent("quiz_teaser_completed", {
        section: SECTION_NAME,
        question_index: TOTAL_QUESTIONS,
        score: nextScore,
      });
      return;
    }

    void loadQuestion(nextAnsweredQuestionIds, questionIndex + 1);
  };

  const trackTelegramCta = () => {
    trackEvent("quiz_teaser_cta_clicked", {
      section: SECTION_NAME,
      question_index: TOTAL_QUESTIONS,
      score,
      destination: "telegram_bot",
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#07111f]/80 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.24)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#4DE2C6]">5-Fragen-Teaser</p>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
          {stage === "question" ? `Frage ${questionIndex} von ${TOTAL_QUESTIONS}` : "kurz & direkt"}
        </span>
      </div>

      {stage === "start" ? (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold leading-tight text-white">Bereit für eine Runde?</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Starte den kurzen Test, beantworte fünf Fragen und bekomme dein Ergebnis sofort.
          </p>
          <button type="button" onClick={startQuiz} className={`mt-6 w-full ${ORANGE_BUTTON_CLASS}`}>
            Quiz starten
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Nach dem Ergebnis: Im Telegram-Bot weitermachen.
          </p>
        </div>
      ) : null}

      {stage === "loading" ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5" aria-live="polite">
          <p className="text-sm font-semibold text-white">Frage wird geladen...</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-[#2AABEE]" />
          </div>
        </div>
      ) : null}

      {stage === "question" && question ? (
        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[#4DE2C6] transition-all"
              style={{ width: `${(questionIndex / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
          <p className="mt-5 text-lg font-semibold leading-7 text-white">{question.prompt}</p>
          <div className="mt-5 grid gap-3">
            {question.answers.map((answer) => (
              <button
                key={answer.id}
                type="button"
                onClick={() => selectAnswer(answer)}
                disabled={selectedAnswerId !== null}
                className={getAnswerClass(answer, selectedAnswerId, question.correctAnswerId)}
                aria-pressed={selectedAnswerId === answer.id}
              >
                {answer.label}
              </button>
            ))}
          </div>

          {selectedAnswerId ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4" aria-live="polite">
              <p className="text-sm font-semibold text-white">
                {selectedAnswerId === question.correctAnswerId ? "Richtig." : "Fast. Die richtige Antwort ist markiert."}
              </p>
              {question.explanation ? (
                <p className="mt-2 text-sm leading-6 text-slate-300">{question.explanation}</p>
              ) : null}
              <button type="button" onClick={continueQuiz} className={`mt-4 w-full ${SECONDARY_BUTTON_CLASS}`}>
                {questionIndex >= TOTAL_QUESTIONS ? "Ergebnis anzeigen" : "Nächste Frage"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {stage === "result" ? (
        <div className="mt-6">
          <div className="rounded-3xl border border-[#4DE2C6]/25 bg-[#4DE2C6]/10 p-5 text-center">
            <p className="text-sm font-semibold text-[#B9FFF2]">Dein Ergebnis</p>
            <p className="mt-2 text-5xl font-semibold text-white">
              {score}/{TOTAL_QUESTIONS}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Dein Ergebnis: {score}/{TOTAL_QUESTIONS}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={trackedTelegramBotUrl}
              target="_blank"
              rel="noreferrer"
              onClick={trackTelegramCta}
              className={ORANGE_BUTTON_CLASS}
            >
              Im Telegram-Bot weitermachen
            </a>
            <button type="button" onClick={startQuiz} className={SECONDARY_BUTTON_CLASS}>
              Noch einmal spielen
            </button>
          </div>
        </div>
      ) : null}

      {stage === "error" ? (
        <div className="mt-6 rounded-2xl border border-[#FFD166]/30 bg-[#FFD166]/10 p-5" role="status">
          <p className="text-sm font-semibold text-[#FFE3A0]">{errorMessage}</p>
          <button type="button" onClick={startQuiz} className={`mt-5 w-full ${SECONDARY_BUTTON_CLASS}`}>
            Noch einmal versuchen
          </button>
        </div>
      ) : null}
    </div>
  );
}
