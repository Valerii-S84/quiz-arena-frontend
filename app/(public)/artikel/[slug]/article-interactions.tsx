"use client";

import { useEffect } from "react";

import { usePublicAnalytics } from "@/app/analytics-provider";

declare global {
  interface Window {
    toggleCard?: (id: string) => void;
    toggleEra?: (id: string) => void;
  }
}

type ArticleInteractionsProps = {
  articleSlug?: string;
  defaultOpenSectionId?: string;
};

function toggleArticleSection(id: string) {
  document.getElementById(id)?.classList.toggle("open");
}

export function ArticleInteractions({ articleSlug, defaultOpenSectionId }: ArticleInteractionsProps) {
  const { trackEvent } = usePublicAnalytics();

  useEffect(() => {
    const previousToggleCard = window.toggleCard;
    const previousToggleEra = window.toggleEra;
    const quizCtas = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-article-quiz-cta]"),
    );

    const trackQuizCta = (event: Event) => {
      const cta = event.currentTarget as HTMLAnchorElement;
      trackEvent("hero_cta_click", {
        article_slug: articleSlug,
        section: "article_kurzantwort",
        cta: "telegram_bot",
        destination: cta.href,
      });
    };

    window.toggleCard = toggleArticleSection;
    window.toggleEra = toggleArticleSection;

    if (defaultOpenSectionId) {
      document.getElementById(defaultOpenSectionId)?.classList.add("open");
    }

    quizCtas.forEach((cta) => cta.addEventListener("click", trackQuizCta));

    return () => {
      quizCtas.forEach((cta) => cta.removeEventListener("click", trackQuizCta));

      if (previousToggleCard) {
        window.toggleCard = previousToggleCard;
      } else {
        delete window.toggleCard;
      }

      if (previousToggleEra) {
        window.toggleEra = previousToggleEra;
      } else {
        delete window.toggleEra;
      }
    };
  }, [articleSlug, defaultOpenSectionId, trackEvent]);

  return null;
}
