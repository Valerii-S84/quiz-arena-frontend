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

const ARTICLE_DISCLOSURE_SELECTOR = ".level-card, .prov-card, .era-card";
const ARTICLE_DISCLOSURE_HEADER_SELECTOR = ".card-header, .prov-header, .era-card-header";
const ARTICLE_DISCLOSURE_BODY_SELECTOR = ".card-body, .prov-body, .era-body";

function syncArticleDisclosureState(section: HTMLElement) {
  const header = section.querySelector<HTMLElement>(ARTICLE_DISCLOSURE_HEADER_SELECTOR);
  header?.setAttribute("aria-expanded", String(section.classList.contains("open")));
}

function setArticleSectionOpen(section: HTMLElement, open: boolean) {
  section.classList.toggle("open", open);
  syncArticleDisclosureState(section);
}

function toggleArticleSection(id: string) {
  const section = document.getElementById(id);

  if (section) {
    setArticleSectionOpen(section, !section.classList.contains("open"));
  }
}

export function ArticleInteractions({ articleSlug, defaultOpenSectionId }: ArticleInteractionsProps) {
  const { trackEvent } = usePublicAnalytics();

  useEffect(() => {
    const previousToggleCard = window.toggleCard;
    const previousToggleEra = window.toggleEra;
    const quizCtas = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-article-quiz-cta]"),
    );
    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-article-toc-link]"),
    );
    const disclosureCleanups: Array<() => void> = [];

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

    const disclosureSections = Array.from(
      document.querySelectorAll<HTMLElement>(ARTICLE_DISCLOSURE_SELECTOR),
    );

    disclosureSections.forEach((section) => {
      const header = section.querySelector<HTMLElement>(ARTICLE_DISCLOSURE_HEADER_SELECTOR);
      const body = section.querySelector<HTMLElement>(ARTICLE_DISCLOSURE_BODY_SELECTOR);

      if (!header) {
        return;
      }

      header.setAttribute("role", "button");
      header.tabIndex = 0;

      if (body && section.id) {
        body.id ||= `${section.id}-content`;
        header.setAttribute("aria-controls", body.id);
      }

      syncArticleDisclosureState(section);

      const syncOnClick = () => syncArticleDisclosureState(section);
      const toggleOnKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        if (section.id) {
          toggleArticleSection(section.id);
        }
      };

      header.addEventListener("click", syncOnClick);
      header.addEventListener("keydown", toggleOnKeyDown);
      disclosureCleanups.push(() => {
        header.removeEventListener("click", syncOnClick);
        header.removeEventListener("keydown", toggleOnKeyDown);
      });
    });

    if (defaultOpenSectionId) {
      const defaultSection = document.getElementById(defaultOpenSectionId);
      if (defaultSection) {
        setArticleSectionOpen(defaultSection, true);
      }
    }

    const revealArticleAnchor = (id: string) => {
      const target = document.getElementById(id);
      const section = target?.closest<HTMLElement>(ARTICLE_DISCLOSURE_SELECTOR);

      if (section) {
        setArticleSectionOpen(section, true);
      }
    };

    const revealLocationHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) {
        revealArticleAnchor(id);
      }
    };

    const revealTocTarget = (event: Event) => {
      const link = event.currentTarget as HTMLAnchorElement;
      const id = decodeURIComponent(new URL(link.href, window.location.href).hash.slice(1));
      if (id) {
        revealArticleAnchor(id);
      }
    };

    tocLinks.forEach((link) => link.addEventListener("click", revealTocTarget));
    window.addEventListener("hashchange", revealLocationHash);
    revealLocationHash();

    quizCtas.forEach((cta) => cta.addEventListener("click", trackQuizCta));

    return () => {
      quizCtas.forEach((cta) => cta.removeEventListener("click", trackQuizCta));
      tocLinks.forEach((link) => link.removeEventListener("click", revealTocTarget));
      window.removeEventListener("hashchange", revealLocationHash);
      disclosureCleanups.forEach((cleanup) => cleanup());

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
