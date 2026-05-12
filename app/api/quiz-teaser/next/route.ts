import { NextResponse } from "next/server";

const QUIZ_BANK_NEXT_PATH = "/v1/quiz-items/next";

type QuizBankConfig = {
  baseUrl: string;
  edgeApiKey: string;
  consumerId: string;
  consumerApiKey: string;
};

type JsonRecord = Record<string, unknown>;

function readPrivateEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getQuizBankConfig(): QuizBankConfig | null {
  const baseUrl = readPrivateEnv("QUIZ_BANK_API_BASE_URL");
  const edgeApiKey = readPrivateEnv("QUIZ_BANK_EDGE_API_KEY");
  const consumerId = readPrivateEnv("QUIZ_BANK_CONSUMER_ID");
  const consumerApiKey = readPrivateEnv("QUIZ_BANK_CONSUMER_API_KEY");

  if (!baseUrl || !edgeApiKey || !consumerId || !consumerApiKey) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    edgeApiKey,
    consumerId,
    consumerApiKey,
  };
}

function unavailableResponse() {
  return NextResponse.json(
    { error: "quiz_teaser_unavailable" },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const record = asRecord(item);
        return record ? [record] : [];
      })
    : [];
}

function readString(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function readBoolean(record: JsonRecord, keys: string[]): boolean {
  return keys.some((key) => record[key] === true);
}

function getNestedQuestion(payload: unknown): JsonRecord | null {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const candidates = [
    root.question,
    root.quiz_item,
    asRecord(root.data)?.question,
    asRecord(root.data)?.quiz_item,
    root.data,
    root,
  ];

  for (const candidate of candidates) {
    const record = asRecord(candidate);
    if (record) {
      return record;
    }
  }

  return null;
}

function normalizeQuestion(payload: unknown) {
  const questionRecord = getNestedQuestion(payload);
  if (!questionRecord) {
    return null;
  }

  const id = readString(questionRecord, ["id", "public_id", "question_id", "questionId"]);
  const questionText = asRecord(questionRecord.question);
  const prompt =
    readString(questionRecord, ["prompt", "text", "question", "title"]) ??
    (questionText
      ? readString(questionText, ["text", "prompt", "stem"])
      : null);
  const answerRecords = asRecordArray(questionRecord.answers ?? questionRecord.options);

  if (!id || !prompt || answerRecords.length < 2) {
    return null;
  }

  const answers = answerRecords.flatMap((answerRecord) => {
    const answerId = readString(answerRecord, ["id", "answer_id", "answerId", "value"]);
    const label = readString(answerRecord, ["label", "text", "answer", "title"]);

    return answerId && label ? [{ id: answerId, label }] : [];
  });

  const correctAnswerId =
    readString(questionRecord, ["correctAnswerId", "correct_answer_id", "correct_id"]) ??
    answers.find((answer) => {
      const source = answerRecords.find((answerRecord) => {
        const answerId = readString(answerRecord, ["id", "answer_id", "answerId", "value"]);
        return answerId === answer.id;
      });
      return source ? readBoolean(source, ["isCorrect", "is_correct", "correct"]) : false;
    })?.id;

  if (answers.length < 2 || !correctAnswerId) {
    return null;
  }

  return {
    id,
    prompt,
    answers,
    correctAnswerId,
    explanation: readString(questionRecord, ["explanation", "hint", "feedback"]) ?? undefined,
  };
}

async function readRequestBody(request: Request): Promise<JsonRecord> {
  try {
    const body = (await request.json()) as unknown;
    return asRecord(body) ?? {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const config = getQuizBankConfig();
  if (!config) {
    return unavailableResponse();
  }

  await readRequestBody(request);

  try {
    const upstreamResponse = await fetch(`${config.baseUrl}${QUIZ_BANK_NEXT_PATH}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": config.edgeApiKey,
        "X-Consumer-Id": config.consumerId,
        "X-QuizBank-API-Key": config.consumerApiKey,
      },
      body: JSON.stringify({
        consumer_id: config.consumerId,
      }),
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      return unavailableResponse();
    }

    const payload = (await upstreamResponse.json()) as unknown;
    const question = normalizeQuestion(payload);

    if (!question) {
      return unavailableResponse();
    }

    return NextResponse.json(
      { question },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return unavailableResponse();
  }
}
