import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig, AIProvider } from "./aiConfig";

export interface AIResponse {
  success: boolean;
  content: string;
  provider: string;
  error?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizGenerationResponse {
  success: boolean;
  questions: QuizQuestion[];
  provider: string;
  error?: string;
}

class AIService {
  private geminiClient: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize Gemini client if API key is available
    if (aiConfig.providers.gemini.apiKey) {
      this.geminiClient = new GoogleGenerativeAI(
        aiConfig.providers.gemini.apiKey,
      );
    }
  }

  // Main method to get AI response with fallback support
  async getResponse(prompt: string, context?: string): Promise<AIResponse> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      return {
        success: false,
        content: "",
        provider: "none",
        error: "No AI providers configured. Please add API keys.",
      };
    }

    // Try providers in fallback order
    for (const providerKey of aiConfig.fallbackOrder) {
      if (availableProviders.includes(providerKey)) {
        try {
          const response = await this.callProvider(
            providerKey,
            prompt,
            context,
          );
          if (response.success) {
            return response;
          }
        } catch (error) {
          console.error(`Provider ${providerKey} failed:`, error);
          continue;
        }
      }
    }

    return {
      success: false,
      content: "",
      provider: "all_failed",
      error: "All AI providers failed to respond",
    };
  }

  // Call specific provider
  private async callProvider(
    providerKey: keyof typeof aiConfig.providers,
    prompt: string,
    context: string | undefined = undefined,
  ): Promise<AIResponse> {
    const provider = aiConfig.providers[providerKey];

    switch (providerKey) {
      case "gemini":
        return await this.callGemini(prompt, context);

      case "huggingface":
        return await this.callHuggingFace(prompt, context, provider);

      case "cohere":
        return await this.callCohere(prompt, context, provider);

      case "openai":
        return await this.callOpenAI(prompt, context, provider);

      default:
        return {
          success: false,
          content: "",
          provider: providerKey,
          error: "Unknown provider",
        };
    }
  }

  // Gemini implementation
  private async callGemini(
    prompt: string,
    context: string | undefined = undefined,
  ): Promise<AIResponse> {
    if (!this.geminiClient) {
      throw new Error("Gemini client not initialized");
    }

    const model = this.geminiClient.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a clear and concise explanation.`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
      provider: "gemini",
    };
  }

  // Hugging Face implementation
  private async callHuggingFace(
    prompt: string,
    context: string | undefined,
    provider: AIProvider,
  ): Promise<AIResponse> {
    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}`
      : prompt;

    const response = await fetch(`${provider.baseUrl}/${provider.model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: provider.maxTokens,
          temperature: provider.temperature,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = Array.isArray(data)
      ? data[0]?.generated_text || data[0]?.summary_text || "No response"
      : data.generated_text || "No response";

    return {
      success: true,
      content: content,
      provider: "huggingface",
    };
  }

  // Cohere implementation
  private async callCohere(
    prompt: string,
    context: string | undefined,
    provider: AIProvider,
  ): Promise<AIResponse> {
    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a clear and concise explanation.`
      : prompt;

    const response = await fetch(`${provider.baseUrl}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        prompt: fullPrompt,
        max_tokens: provider.maxTokens,
        temperature: provider.temperature,
        k: 0,
        stop_sequences: [],
        return_likelihoods: "NONE",
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.generations[0]?.text || "No response",
      provider: "cohere",
    };
  }

  // OpenAI implementation
  private async callOpenAI(
    prompt: string,
    context: string | undefined,
    provider: AIProvider,
  ): Promise<AIResponse> {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful educational assistant. Provide clear and concise explanations suitable for students.",
      },
      {
        role: "user",
        content: context
          ? `Context: ${context}\n\nQuestion: ${prompt}`
          : prompt,
      },
    ];

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages,
        max_tokens: provider.maxTokens,
        temperature: provider.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0]?.message?.content || "No response",
      provider: "openai",
    };
  }

  // Generate quiz questions
  async generateQuiz(
    topic: string,
    numQuestions: number = 5,
    difficulty: string = "medium",
  ): Promise<QuizGenerationResponse> {
    const prompt = `Generate ${numQuestions} multiple choice questions about "${topic}" with ${difficulty} difficulty level.

Format your response as a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Important:
- correctAnswer should be the index (0-3) of the correct option
- Include exactly 4 options for each question
- Make questions educational and clear
- Provide helpful explanations
- Return only the JSON array, no additional text`;

    try {
      const response = await this.getResponse(prompt);

      if (!response.success) {
        return {
          success: false,
          questions: [],
          provider: response.provider,
          error: response.error,
        };
      }

      // Try to parse the JSON response
      let questions: QuizQuestion[] = [];
      try {
        // Clean the response to extract JSON
        let jsonText = response.content.trim();

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

        // Find JSON array in the response
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }

        questions = JSON.parse(jsonText);

        // Validate the structure
        questions = questions.filter(
          (q) =>
            q.question &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correctAnswer === "number" &&
            q.correctAnswer >= 0 &&
            q.correctAnswer < 4 &&
            q.explanation,
        );
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", parseError);
        return {
          success: false,
          questions: [],
          provider: response.provider,
          error: "Failed to parse quiz questions from AI response",
        };
      }

      return {
        success: true,
        questions: questions,
        provider: response.provider,
      };
    } catch (error) {
      return {
        success: false,
        questions: [],
        provider: "unknown",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get doubt explanation with educational focus
  async explainConcept(
    question: string,
    subject?: string,
    gradeLevel?: string,
  ): Promise<AIResponse> {
    let prompt = `Explain this concept in simple terms: "${question}"`;

    if (subject) {
      prompt += `\n\nSubject: ${subject}`;
    }

    if (gradeLevel) {
      prompt += `\nGrade Level: ${gradeLevel}`;
    }

    prompt += `\n\nPlease provide:
1. A clear, simple explanation
2. A practical example if applicable
3. Key points to remember

Keep the explanation appropriate for students and easy to understand.`;

    return await this.getResponse(prompt);
  }

  // Get available providers
  private getAvailableProviders(): Array<keyof typeof aiConfig.providers> {
    return Object.entries(aiConfig.providers)
      .filter(([, provider]) => provider.apiKey)
      .map(([key]) => key) as Array<keyof typeof aiConfig.providers>;
  }

  // Check if any provider is available
  isConfigured(): boolean {
    return this.getAvailableProviders().length > 0;
  }

  // Get configuration status
  getConfigurationStatus() {
    const available = this.getAvailableProviders();
    const total = Object.keys(aiConfig.providers).length;

    return {
      configured: available.length,
      total: total,
      available: available,
      hasAnyProvider: available.length > 0,
    };
  }
}

export default new AIService();
