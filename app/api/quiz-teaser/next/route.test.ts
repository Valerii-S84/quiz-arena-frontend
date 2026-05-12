import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const envKeys = [
  "QUIZ_BANK_API_BASE_URL",
  "QUIZ_BANK_EDGE_API_KEY",
  "QUIZ_BANK_CONSUMER_ID",
  "QUIZ_BANK_CONSUMER_API_KEY",
];

afterEach(() => {
  for (const key of envKeys) {
    delete process.env[key];
  }
  vi.restoreAllMocks();
});

describe("quiz teaser proxy route", () => {
  it("fails closed when private Quiz Bank configuration is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/quiz-teaser/next", {
        method: "POST",
        body: JSON.stringify({ answeredQuestionIds: [] }),
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "quiz_teaser_unavailable" });
  });

  it("proxies through the server route without returning credentials", async () => {
    process.env.QUIZ_BANK_API_BASE_URL = "https://quiz-bank.example";
    process.env.QUIZ_BANK_EDGE_API_KEY = "edge-secret";
    process.env.QUIZ_BANK_CONSUMER_ID = "website";
    process.env.QUIZ_BANK_CONSUMER_API_KEY = "consumer-secret";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          question: {
            id: "q1",
            prompt: "Was ist richtig?",
            answers: [
              { id: "a", label: "A", is_correct: true },
              { id: "b", label: "B" },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/quiz-teaser/next", {
        method: "POST",
        body: JSON.stringify({ answeredQuestionIds: ["done"] }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    const [upstreamUrl, upstreamInit] = fetchSpy.mock.calls[0];
    const headers = new Headers((upstreamInit as RequestInit).headers);

    expect(upstreamUrl).toBe("https://quiz-bank.example/v1/quiz-items/next");
    expect(headers.get("X-API-Key")).toBe("edge-secret");
    expect(headers.get("X-Consumer-Id")).toBe("website");
    expect(headers.get("X-QuizBank-API-Key")).toBe("consumer-secret");
    expect((upstreamInit as RequestInit).body).toBe(JSON.stringify({ consumer_id: "website" }));
    expect(JSON.stringify(payload)).not.toContain("edge-secret");
    expect(JSON.stringify(payload)).not.toContain("consumer-secret");
    expect(payload.question).toMatchObject({
      id: "q1",
      prompt: "Was ist richtig?",
      correctAnswerId: "a",
    });
  });
});
