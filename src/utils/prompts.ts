import { Answer } from "./schemas";

export const generateQuizPrompt = (title: string, content: string) => `
As an educational quiz creator, generate a comprehensive quiz based on the following material:

Title: ${title}
Content: ${content}

Create 5 multiple-choice questions and format them in the following JSON structure:

{
  "questions": [
    {
      "id": 1,
      "title": "Question text here",
      "options": [
        {
          "id": 1,
          "content": "First option"
        },
        {
          "id": 2,
          "content": "Second option"
        },
        {
          "id": 3,
          "content": "Third option"
        },
        {
          "id": 4,
          "content": "Fourth option"
        }
      ],
      "correct": integer of correct option
    }
  ]
}

Requirements:
1. Each question must have exactly 4 options
2. IDs must be sequential numbers
3. The "correct" field must match exactly one of the option content strings
4. Focus on key concepts from the material
5. Questions should vary in difficulty
6. Ensure all JSON formatting is valid

Return only the JSON object with no additional text or explanation.
`;

// TODO: Need to implement a new interface and logic for the accumulation of the responses from the user from the previous test

export const generateAdaptiveQuizPrompt = (
  title: string,
  content: string,
  previousAnswers: Answer[],
) => `
As an educational quiz creator, generate a new quiz based on the following material and the user's previous performance:

Title: ${title}
Content: ${content}

User's Previous Performance:
${previousAnswers
  .map(
    (answer) =>
      `Question: ${answer.question}
   Answered Correctly: ${answer.isCorrect}`,
  )
  .join("\n")}

Create a new quiz that:
1. Focuses more on topics where the user made mistakes
2. Includes some new questions on related concepts
3. Rephrases some previously incorrect questions differently
4. Maintains some questions on topics they understood well

Format the questions in this JSON structure:
{
  "questions": [
    {
      "id": 1,
      "title": "Question text here",
      "options": [
        {
          "id": 1,
          "content": "First option"
        },
        {
          "id": 2,
          "content": "Second option"
        },
        {
          "id": 3,
          "content": "Third option"
        },
        {
          "id": 4,
          "content": "Fourth option"
        }
      ],
      "correct": 2
    }
  ]
}

Requirements:
1. Each question must have exactly 4 options
2. IDs must be sequential numbers
3. The "correct" field must be the ID of the correct option
4. Include a mix of easy and challenging questions
5. Ensure questions are clear and unambiguous

Return only the JSON object with no additional text or explanation.
`;
