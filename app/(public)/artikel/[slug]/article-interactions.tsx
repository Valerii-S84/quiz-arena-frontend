"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    toggleCard?: (id: string) => void;
    toggleEra?: (id: string) => void;
  }
}

type ArticleInteractionsProps = {
  defaultOpenSectionId?: string;
};

function toggleArticleSection(id: string) {
  document.getElementById(id)?.classList.toggle("open");
}

export function ArticleInteractions({ defaultOpenSectionId }: ArticleInteractionsProps) {
  useEffect(() => {
    const previousToggleCard = window.toggleCard;
    const previousToggleEra = window.toggleEra;

    window.toggleCard = toggleArticleSection;
    window.toggleEra = toggleArticleSection;

    if (defaultOpenSectionId) {
      document.getElementById(defaultOpenSectionId)?.classList.add("open");
    }

    return () => {
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
  }, [defaultOpenSectionId]);

  return null;
}
