import { ChatCompletionResponse } from "@mistralai/mistralai/models/components";

export const exampleMistralResponse: ChatCompletionResponse = {
  id: "1234567890abc", // Example ID
  object: "my-response-123", // Example object identifier
  model: "mistral-7b-chat", // Example model name
  usage: {
    promptTokens: 1234,
    completionTokens: 5678,
    totalTokens: 9012, // Sum of prompt and completion tokens
  },
  created: undefined, // Optional timestamp in ISO format or null if not provided
  choices: [
    {
      index: 1,
      message: {
        content: JSON.stringify({
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
        }),
      },
      finishReason: "error",
    },
  ],
};

export const exampleBadJsonMistralResponse: ChatCompletionResponse = {
  id: "1234567890abc", // Example ID
  object: "my-response-123", // Example object identifier
  model: "mistral-7b-chat", // Example model name
  usage: {
    promptTokens: 1234,
    completionTokens: 5678,
    totalTokens: 9012, // Sum of prompt and completion tokens
  },
  created: undefined, // Optional timestamp in ISO format or null if not provided
  choices: [
    {
      index: 1,
      message: {
        content: "Bad content",
      },
      finishReason: "error",
    },
  ],
};

export const exampleEmptyMistralResponse: ChatCompletionResponse = {
  id: "1234567890abc", // Example ID
  object: "my-response-123", // Example object identifier
  model: "mistral-7b-chat", // Example model name
  usage: {
    promptTokens: 1234,
    completionTokens: 5678,
    totalTokens: 9012, // Sum of prompt and completion tokens
  },
  created: undefined, // Optional timestamp in ISO format or null if not provided
  choices: [
    {
      index: 1,
      message: {
        content: JSON.stringify({
          questions: [],
        }),
      },
      finishReason: "error",
    },
  ],
};

export const exampleInsufficientQuestionsMistralResponse: ChatCompletionResponse =
  {
    id: "1234567890abc", // Example ID
    object: "my-response-123", // Example object identifier
    model: "mistral-7b-chat", // Example model name
    usage: {
      promptTokens: 1234,
      completionTokens: 5678,
      totalTokens: 9012, // Sum of prompt and completion tokens
    },
    created: undefined, // Optional timestamp in ISO format or null if not provided
    choices: [
      {
        index: 1,
        message: {
          content: JSON.stringify({
            questions: [
              {
                id: 1,
                title: "Test Question",
                options: [
                  { id: 1, content: "Option 1" },
                  { id: 2, content: "Option 2" },
                ],
                correct: 2,
              },
            ],
          }),
        },
        finishReason: "error",
      },
    ],
  };

export const exampleOutOfRangeMistralResponse: ChatCompletionResponse = {
  id: "1234567890abc", // Example ID
  object: "my-response-123", // Example object identifier
  model: "mistral-7b-chat", // Example model name
  usage: {
    promptTokens: 1234,
    completionTokens: 5678,
    totalTokens: 9012, // Sum of prompt and completion tokens
  },
  created: undefined, // Optional timestamp in ISO format or null if not provided
  choices: [
    {
      index: 1,
      message: {
        content: JSON.stringify({
          questions: [
            {
              id: 1,
              title: "Test Question",
              options: [
                { id: 1, content: "Option 1" },
                { id: 2, content: "Option 2" },
              ],
              correct: 2,
            },
          ],
        }),
      },
      finishReason: "error",
    },
  ],
};
