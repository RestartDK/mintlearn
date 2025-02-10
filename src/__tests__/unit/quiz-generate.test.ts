// tests/utils/generate.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateQuizFromMistral } from "@/utils/generate";
import { client } from "@/utils/client";
import {
  exampleBadJsonMistralResponse,
  exampleEmptyMistralResponse,
  exampleInsufficientQuestionsMistralResponse,
  exampleMistralResponse,
  exampleOutOfRangeMistralResponse,
} from "./mistral-example-responses";

// This prevents any real API calls by replacing the entire module
vi.mock("@/utils/client", () => ({
  client: {
    chat: {
      complete: vi.fn(),
    },
  },
}));

describe("generateQuizFromMistral", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Valid quiz response that should pass Zod validation
  const validQuizResponse = {
    questions: [
      {
        id: 1,
        title: "Test Question",
        options: [
          { id: 1, content: "Option 1" },
          { id: 2, content: "Option 2" },
          { id: 3, content: "Option 3" },
          { id: 4, content: "Option 4" },
        ],
        correct: 2,
      },
    ],
  };

  it("should generate a valid quiz when API returns correct format", async () => {
    // Mock successful API response
    vi.mocked(client.chat.complete).mockResolvedValueOnce(
      exampleMistralResponse,
    );

    const result = await generateQuizFromMistral(
      "Test Quiz",
      "Test content",
      "test prompt",
    );

    expect(result).toEqual(validQuizResponse);
  });

  it("should fail when API returns invalid JSON", async () => {
    // Mock API returning invalid JSON
    vi.mocked(client.chat.complete).mockResolvedValueOnce(
      exampleBadJsonMistralResponse,
    );

    await expect(
      generateQuizFromMistral("Test Quiz", "Test content", "test prompt"),
    ).rejects.toThrow();
  });

  it("should fail Zod validation when questions array is empty", async () => {
    // Mock API returning empty questions array
    vi.mocked(client.chat.complete).mockResolvedValueOnce(
      exampleEmptyMistralResponse,
    );

    await expect(
      generateQuizFromMistral("Test Quiz", "Test content", "test prompt"),
    ).rejects.toThrow();
  });

  it("should fail Zod validation when question has fewer than 4 options", async () => {
    vi.mocked(client.chat.complete).mockResolvedValueOnce(
      exampleInsufficientQuestionsMistralResponse,
    );

    await expect(
      generateQuizFromMistral("Test Quiz", "Test content", "test prompt"),
    ).rejects.toThrow();
  });

  it("should fail Zod validation when correct answer is out of range", async () => {
    vi.mocked(client.chat.complete).mockResolvedValueOnce(
      exampleOutOfRangeMistralResponse,
    );

    await expect(
      generateQuizFromMistral("Test Quiz", "Test content", "test prompt"),
    ).rejects.toThrow();
  });

  it("should handle API errors", async () => {
    // Mock API throwing an error
    vi.mocked(client.chat.complete).mockRejectedValueOnce(
      new Error("API Error"),
    );

    await expect(
      generateQuizFromMistral("Test Quiz", "Test content", "test prompt"),
    ).rejects.toThrow("Could not generate quiz");
  });
});
