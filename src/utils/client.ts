import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY || "your_api_key";

export const client = new Mistral({ apiKey: apiKey });
