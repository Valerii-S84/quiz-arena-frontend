import type { QuizTeaserQuestion } from "./quiz-teaser-api";

export type QuizTeaserLevel = "A1" | "A2" | "B1" | "B2";

export type CuratedQuizTeaserQuestion = QuizTeaserQuestion & {
  day: number;
  position: number;
  level: QuizTeaserLevel;
  topic: string;
};

export type CuratedQuizTeaserDay = {
  day: number;
  title: string;
  description: string;
  questions: readonly CuratedQuizTeaserQuestion[];
};

export const CURATED_QUIZ_DAYS: readonly CuratedQuizTeaserDay[] = [
  {
    day: 1,
    title: "Sicher durch den Alltag",
    description: "Vom Tagesablauf bis zur passenden Verbindung im Satz.",
    questions: [
      {
        id: "curated-d1-q1",
        day: 1,
        position: 1,
        level: "A1",
        topic: "Im Café",
        prompt: "Du möchtest im Café höflich bestellen. Welcher Satz passt?",
        answers: [
          { id: "curated-d1-q1-a", label: "Ich hätte gern einen Tee, bitte." },
          { id: "curated-d1-q1-b", label: "Ich habe gern einen Tee." },
          { id: "curated-d1-q1-c", label: "Ich würde gern einen Tee, bitte." },
          { id: "curated-d1-q1-d", label: "Ich möchte einen Tee gehabt." },
        ],
        correctAnswerId: "curated-d1-q1-a",
        explanation:
          "„Ich hätte gern …“ ist eine freundliche Standardform beim Bestellen. Mit „bitte“ klingt der Satz vollständig und höflich.",
      },
      {
        id: "curated-d1-q2",
        day: 1,
        position: 2,
        level: "A2",
        topic: "Unterwegs",
        prompt:
          "Auf der Anzeigetafel steht: „Der Zug nach Bonn fällt heute aus.“ Was bedeutet das?",
        answers: [
          { id: "curated-d1-q2-a", label: "Der Zug fährt heute früher." },
          { id: "curated-d1-q2-b", label: "Der Zug fährt von einem anderen Gleis." },
          { id: "curated-d1-q2-c", label: "Der Zug fährt heute nicht." },
          { id: "curated-d1-q2-d", label: "Der Zug hält nur in Bonn." },
        ],
        correctAnswerId: "curated-d1-q2-c",
        explanation:
          "„Ein Zug fällt aus“ bedeutet, dass diese Verbindung nicht fährt. Du musst nach einer anderen Verbindung suchen.",
      },
      {
        id: "curated-d1-q3",
        day: 1,
        position: 3,
        level: "B1",
        topic: "Termine",
        prompt: "Du kannst einen Termin nicht einhalten. Welche Nachricht ist höflich und vollständig?",
        answers: [
          {
            id: "curated-d1-q3-a",
            label:
              "Leider kann ich den Termin morgen nicht wahrnehmen. Könnten wir einen neuen Termin vereinbaren?",
          },
          { id: "curated-d1-q3-b", label: "Ich komme nicht. Geben Sie mir einen anderen Termin." },
          { id: "curated-d1-q3-c", label: "Der Termin ist nicht, weil ich keine Zeit." },
          { id: "curated-d1-q3-d", label: "Morgen würde ich vielleicht nicht gekommen sein." },
        ],
        correctAnswerId: "curated-d1-q3-a",
        explanation:
          "Eine gute Absage nennt das Problem respektvoll und schlägt direkt den nächsten Schritt vor. „Einen Termin wahrnehmen“ ist dabei die passende formelle Wendung.",
      },
      {
        id: "curated-d1-q4",
        day: 1,
        position: 4,
        level: "B2",
        topic: "Zwischentöne",
        prompt:
          "Der Vermieter schreibt: „Die Reparatur lässt sich nicht länger aufschieben.“ Was meint er?",
        answers: [
          { id: "curated-d1-q4-a", label: "Die Reparatur ist nicht mehr notwendig." },
          { id: "curated-d1-q4-b", label: "Die Reparatur muss bald durchgeführt werden." },
          { id: "curated-d1-q4-c", label: "Die Reparatur soll weiter verschoben werden." },
          { id: "curated-d1-q4-d", label: "Die Reparatur wird günstiger als erwartet." },
        ],
        correctAnswerId: "curated-d1-q4-b",
        explanation:
          "„Etwas aufschieben“ heißt, etwas später zu erledigen. „Nicht länger aufschieben“ signalisiert deshalb klaren Handlungsbedarf.",
      },
      {
        id: "curated-d1-q5",
        day: 1,
        position: 5,
        level: "B2",
        topic: "Wortverbindungen",
        prompt: "Nach langem Überlegen hat sie eine Entscheidung ___.",
        answers: [
          { id: "curated-d1-q5-a", label: "gemacht" },
          { id: "curated-d1-q5-b", label: "gestellt" },
          { id: "curated-d1-q5-c", label: "getroffen" },
          { id: "curated-d1-q5-d", label: "gesetzt" },
        ],
        correctAnswerId: "curated-d1-q5-c",
        explanation:
          "Die feste Verbindung lautet „eine Entscheidung treffen“. Im Perfekt heißt es „hat eine Entscheidung getroffen“.",
      },
    ],
  },
  {
    day: 2,
    title: "Deutsch im Beruf",
    description: "Nützliche Strukturen für Kollegium, Bewerbung und Büro.",
    questions: [
      {
        id: "curated-d2-q1",
        day: 2,
        position: 1,
        level: "A1",
        topic: "Erster Arbeitstag",
        prompt: "Du bist neu im Team. Welche Vorstellung passt?",
        answers: [
          { id: "curated-d2-q1-a", label: "Guten Morgen, ich heiße Lara und bin neue im Team." },
          { id: "curated-d2-q1-b", label: "Guten Morgen, ich heiße Lara und bin neu im Team." },
          { id: "curated-d2-q1-c", label: "Guten Morgen, mein Name Lara und neu im Team." },
          { id: "curated-d2-q1-d", label: "Guten Morgen, ich bin Lara und arbeite neu im Team." },
        ],
        correctAnswerId: "curated-d2-q1-b",
        explanation:
          "„Ich heiße … und bin neu im Team“ ist korrekt, freundlich und natürlich. Zwei kurze Hauptsätze werden hier mit „und“ verbunden.",
      },
      {
        id: "curated-d2-q2",
        day: 2,
        position: 2,
        level: "A2",
        topic: "Höfliche Bitte",
        prompt: "Könnten Sie mir bitte die Datei ___?",
        answers: [
          { id: "curated-d2-q2-a", label: "schicken" },
          { id: "curated-d2-q2-b", label: "schickt" },
          { id: "curated-d2-q2-c", label: "geschickt" },
          { id: "curated-d2-q2-d", label: "zu schicken" },
        ],
        correctAnswerId: "curated-d2-q2-a",
        explanation:
          "Nach dem Modalverb „könnten“ steht der Infinitiv am Satzende: „Könnten Sie … schicken?“ Das klingt höflich und professionell.",
      },
      {
        id: "curated-d2-q3",
        day: 2,
        position: 3,
        level: "B1",
        topic: "Fristen verstehen",
        prompt:
          "In der E-Mail steht: „Bitte reichen Sie die Unterlagen spätestens bis Mittwoch ein.“ Was heißt das?",
        answers: [
          { id: "curated-d2-q3-a", label: "Die Unterlagen dürfen erst am Donnerstag kommen." },
          { id: "curated-d2-q3-b", label: "Die Unterlagen müssen genau am Mittwoch kommen." },
          { id: "curated-d2-q3-c", label: "Die Unterlagen müssen spätestens am Mittwoch abgegeben werden." },
          { id: "curated-d2-q3-d", label: "Am Mittwoch ist eine Abgabe nicht mehr möglich." },
        ],
        correctAnswerId: "curated-d2-q3-c",
        explanation:
          "„Spätestens bis Mittwoch“ setzt Mittwoch als letzten möglichen Termin. Früher ist erlaubt, später nicht.",
      },
      {
        id: "curated-d2-q4",
        day: 2,
        position: 4,
        level: "B2",
        topic: "Irreale Vergangenheit",
        prompt: "Wenn ich früher von der Stelle erfahren hätte, ___ ich mich beworben.",
        answers: [
          { id: "curated-d2-q4-a", label: "habe" },
          { id: "curated-d2-q4-b", label: "hätte" },
          { id: "curated-d2-q4-c", label: "würde" },
          { id: "curated-d2-q4-d", label: "wäre" },
        ],
        correctAnswerId: "curated-d2-q4-b",
        explanation:
          "Für eine nicht realisierte Handlung in der Vergangenheit verwendet man Konjunktiv II: „Wenn ich … erfahren hätte, hätte ich mich beworben.“",
      },
      {
        id: "curated-d2-q5",
        day: 2,
        position: 5,
        level: "B2",
        topic: "Passiv",
        prompt: "Die Unterlagen müssen bis Freitag ___ werden.",
        answers: [
          { id: "curated-d2-q5-a", label: "einreichen" },
          { id: "curated-d2-q5-b", label: "eingereicht" },
          { id: "curated-d2-q5-c", label: "einreichten" },
          { id: "curated-d2-q5-d", label: "einzureichen" },
        ],
        correctAnswerId: "curated-d2-q5-b",
        explanation:
          "Beim Passiv mit Modalverb lautet die Struktur: Modalverb + Partizip II + „werden“ — „müssen eingereicht werden“.",
      },
    ],
  },
  {
    day: 3,
    title: "Wohnen und Termine",
    description: "Deutsch für Wohnung, Service und verlässliche Absprachen.",
    questions: [
      {
        id: "curated-d3-q1",
        day: 3,
        position: 1,
        level: "A1",
        topic: "Wohnort",
        prompt: "Jemand fragt: „Wo wohnst du?“ Welche Antwort passt?",
        answers: [
          { id: "curated-d3-q1-a", label: "Ich wohne nach Berlin." },
          { id: "curated-d3-q1-b", label: "Ich wohne zu Berlin." },
          { id: "curated-d3-q1-c", label: "Ich wohne in Berlin." },
          { id: "curated-d3-q1-d", label: "Ich wohne aus Berlin." },
        ],
        correctAnswerId: "curated-d3-q1-c",
        explanation:
          "Für einen Wohnort in einer Stadt verwendet man „in“: „Ich wohne in Berlin.“ „Aus Berlin“ beschreibt dagegen die Herkunft.",
      },
      {
        id: "curated-d3-q2",
        day: 3,
        position: 2,
        level: "A2",
        topic: "Uhrzeit",
        prompt: "Der Techniker kommt zwischen 9 ___ 11 Uhr.",
        answers: [
          { id: "curated-d3-q2-a", label: "bis" },
          { id: "curated-d3-q2-b", label: "oder" },
          { id: "curated-d3-q2-c", label: "und" },
          { id: "curated-d3-q2-d", label: "seit" },
        ],
        correctAnswerId: "curated-d3-q2-c",
        explanation:
          "Die feste Zeitangabe lautet „zwischen … und …“. Deshalb heißt es „zwischen 9 und 11 Uhr“.",
      },
      {
        id: "curated-d3-q3",
        day: 3,
        position: 3,
        level: "B1",
        topic: "Wohnungsanzeigen",
        prompt: "In einer Anzeige steht: „Die Wohnung ist ab sofort bezugsfrei.“ Was bedeutet das?",
        answers: [
          { id: "curated-d3-q3-a", label: "Man kann sofort einziehen." },
          { id: "curated-d3-q3-b", label: "Man muss keine Miete zahlen." },
          { id: "curated-d3-q3-c", label: "Die Wohnung hat keine Möbel." },
          { id: "curated-d3-q3-d", label: "Die Wohnung wird bald renoviert." },
        ],
        correctAnswerId: "curated-d3-q3-a",
        explanation:
          "„Bezugsfrei“ bedeutet, dass die Wohnung nicht bewohnt ist und übernommen werden kann. „Ab sofort“ heißt: ohne Wartezeit.",
      },
      {
        id: "curated-d3-q4",
        day: 3,
        position: 4,
        level: "B2",
        topic: "Bedingungen",
        prompt: "___ der Termin kurzfristig ausfallen, informieren wir Sie sofort.",
        answers: [
          { id: "curated-d3-q4-a", label: "Sollte" },
          { id: "curated-d3-q4-b", label: "Würde" },
          { id: "curated-d3-q4-c", label: "Hätte" },
          { id: "curated-d3-q4-d", label: "Wäre" },
        ],
        correctAnswerId: "curated-d3-q4-a",
        explanation:
          "„Sollte …“ ist eine formelle Bedingung ohne „wenn“: „Sollte der Termin ausfallen“ bedeutet „Falls der Termin ausfällt“.",
      },
      {
        id: "curated-d3-q5",
        day: 3,
        position: 5,
        level: "B2",
        topic: "Feste Wendungen",
        prompt: "Bei hohen Heizkosten sollte man einen Anbieterwechsel in Betracht ___.",
        answers: [
          { id: "curated-d3-q5-a", label: "bringen" },
          { id: "curated-d3-q5-b", label: "stellen" },
          { id: "curated-d3-q5-c", label: "ziehen" },
          { id: "curated-d3-q5-d", label: "nehmen" },
        ],
        correctAnswerId: "curated-d3-q5-c",
        explanation:
          "„Etwas in Betracht ziehen“ bedeutet, eine Möglichkeit ernsthaft zu prüfen oder zu erwägen.",
      },
    ],
  },
  {
    day: 4,
    title: "Klar kommunizieren",
    description: "Fragen, Zusammenhänge und Aussagen präzise formulieren.",
    questions: [
      {
        id: "curated-d4-q1",
        day: 4,
        position: 1,
        level: "A1",
        topic: "Fragewörter",
        prompt: "___ beginnt der Deutschkurs? – Um 18 Uhr.",
        answers: [
          { id: "curated-d4-q1-a", label: "Wo" },
          { id: "curated-d4-q1-b", label: "Wann" },
          { id: "curated-d4-q1-c", label: "Wer" },
          { id: "curated-d4-q1-d", label: "Warum" },
        ],
        correctAnswerId: "curated-d4-q1-b",
        explanation:
          "Die Antwort nennt eine Uhrzeit. Nach einem Zeitpunkt fragt man mit „Wann?“.",
      },
      {
        id: "curated-d4-q2",
        day: 4,
        position: 2,
        level: "A2",
        topic: "Folgen ausdrücken",
        prompt: "Der Zug hatte Verspätung, ___ kam ich zehn Minuten später an.",
        answers: [
          { id: "curated-d4-q2-a", label: "deshalb" },
          { id: "curated-d4-q2-b", label: "weil" },
          { id: "curated-d4-q2-c", label: "denn" },
          { id: "curated-d4-q2-d", label: "obwohl" },
        ],
        correctAnswerId: "curated-d4-q2-a",
        explanation:
          "„Deshalb“ nennt eine Folge und besetzt Position 1. Danach folgt direkt das Verb: „deshalb kam ich … an“.",
      },
      {
        id: "curated-d4-q3",
        day: 4,
        position: 3,
        level: "B1",
        topic: "Indirekte Fragen",
        prompt: "Können Sie mir sagen, ___ der Kurs noch freie Plätze hat?",
        answers: [
          { id: "curated-d4-q3-a", label: "dass" },
          { id: "curated-d4-q3-b", label: "ob" },
          { id: "curated-d4-q3-c", label: "wenn" },
          { id: "curated-d4-q3-d", label: "als" },
        ],
        correctAnswerId: "curated-d4-q3-b",
        explanation:
          "Eine indirekte Ja-Nein-Frage beginnt mit „ob“. Das Verb steht am Ende: „ob der Kurs … hat“.",
      },
      {
        id: "curated-d4-q4",
        day: 4,
        position: 4,
        level: "B2",
        topic: "Indirekte Rede",
        prompt:
          "In formeller indirekter Rede: Die Sprecherin sagte, das neue Angebot ___ ab Mai verfügbar.",
        answers: [
          { id: "curated-d4-q4-a", label: "ist" },
          { id: "curated-d4-q4-b", label: "wäre" },
          { id: "curated-d4-q4-c", label: "sei" },
          { id: "curated-d4-q4-d", label: "war" },
        ],
        correctAnswerId: "curated-d4-q4-c",
        explanation:
          "In der formellen indirekten Rede steht häufig Konjunktiv I. Aus „Das Angebot ist verfügbar“ wird „sie sagte, es sei verfügbar“.",
      },
      {
        id: "curated-d4-q5",
        day: 4,
        position: 5,
        level: "B2",
        topic: "Präzise sprechen",
        prompt:
          "Nora kann komplexe Sachverhalte „auf den Punkt bringen“. Was kann sie besonders gut?",
        answers: [
          { id: "curated-d4-q5-a", label: "Das Wesentliche klar und knapp ausdrücken." },
          { id: "curated-d4-q5-b", label: "Möglichst lange und detailliert sprechen." },
          { id: "curated-d4-q5-c", label: "Kritische Fragen vollständig vermeiden." },
          { id: "curated-d4-q5-d", label: "Jede Aussage mit Zahlen beweisen." },
        ],
        correctAnswerId: "curated-d4-q5-a",
        explanation:
          "„Etwas auf den Punkt bringen“ bedeutet, den Kern einer Sache verständlich und ohne unnötige Umwege auszudrücken.",
      },
    ],
  },
  {
    day: 5,
    title: "Cleverer lernen",
    description: "Strukturen, die beim Lernen und in Prüfungen wirklich helfen.",
    questions: [
      {
        id: "curated-d5-q1",
        day: 5,
        position: 1,
        level: "A1",
        topic: "Perfekt",
        prompt: "Gestern ___ ich meine Hausaufgaben gemacht.",
        answers: [
          { id: "curated-d5-q1-a", label: "bin" },
          { id: "curated-d5-q1-b", label: "habe" },
          { id: "curated-d5-q1-c", label: "werde" },
          { id: "curated-d5-q1-d", label: "haben" },
        ],
        correctAnswerId: "curated-d5-q1-b",
        explanation:
          "Das Perfekt von „machen“ wird mit „haben“ gebildet: „Ich habe meine Hausaufgaben gemacht.“",
      },
      {
        id: "curated-d5-q2",
        day: 5,
        position: 2,
        level: "A2",
        topic: "Vergleiche",
        prompt: "Mit dieser Lernroutine kann ich mich ___ konzentrieren als früher.",
        answers: [
          { id: "curated-d5-q2-a", label: "gut" },
          { id: "curated-d5-q2-b", label: "besser" },
          { id: "curated-d5-q2-c", label: "am besten" },
          { id: "curated-d5-q2-d", label: "besten" },
        ],
        correctAnswerId: "curated-d5-q2-b",
        explanation:
          "„Als früher“ signalisiert einen Vergleich. Der Komparativ von „gut“ lautet „besser“.",
      },
      {
        id: "curated-d5-q3",
        day: 5,
        position: 3,
        level: "B1",
        topic: "Zweiteilige Konnektoren",
        prompt: "Der Kurs ist ___ günstig als auch gut organisiert.",
        answers: [
          { id: "curated-d5-q3-a", label: "entweder" },
          { id: "curated-d5-q3-b", label: "weder" },
          { id: "curated-d5-q3-c", label: "sowohl" },
          { id: "curated-d5-q3-d", label: "zwar" },
        ],
        correctAnswerId: "curated-d5-q3-c",
        explanation:
          "Die vollständige Verbindung lautet „sowohl … als auch“. Sie verbindet zwei positive Eigenschaften: günstig und gut organisiert.",
      },
      {
        id: "curated-d5-q4",
        day: 5,
        position: 4,
        level: "B2",
        topic: "Mittel und Methode",
        prompt: "Du verbesserst deine Aussprache, ___ du dich regelmäßig aufnimmst und vergleichst.",
        answers: [
          { id: "curated-d5-q4-a", label: "indem" },
          { id: "curated-d5-q4-b", label: "obwohl" },
          { id: "curated-d5-q4-c", label: "sodass" },
          { id: "curated-d5-q4-d", label: "nachdem" },
        ],
        correctAnswerId: "curated-d5-q4-a",
        explanation:
          "„Indem“ erklärt, mit welcher Methode ein Ziel erreicht wird: Die Aufnahme und der Vergleich verbessern die Aussprache.",
      },
      {
        id: "curated-d5-q5",
        day: 5,
        position: 5,
        level: "B2",
        topic: "Modalverb im Perfekt",
        prompt: "Das Missverständnis hätte durch eine klare E-Mail vermieden werden ___.",
        answers: [
          { id: "curated-d5-q5-a", label: "gekonnt" },
          { id: "curated-d5-q5-b", label: "können" },
          { id: "curated-d5-q5-c", label: "könnte" },
          { id: "curated-d5-q5-d", label: "kann" },
        ],
        correctAnswerId: "curated-d5-q5-b",
        explanation:
          "Mit Modalverb steht am Ende der sogenannte Ersatzinfinitiv: „hätte vermieden werden können“.",
      },
    ],
  },
] as const;

export const CURATED_QUIZ_DAY_COUNT = CURATED_QUIZ_DAYS.length;
export const QUESTIONS_PER_QUIZ_DAY = 5;

export function getCuratedQuizQuestion(
  dayIndex: number,
  questionIndex: number,
): CuratedQuizTeaserQuestion | null {
  return CURATED_QUIZ_DAYS[dayIndex]?.questions[questionIndex] ?? null;
}
