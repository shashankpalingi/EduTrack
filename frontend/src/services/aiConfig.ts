// AI Service Configuration
export interface AIProvider {
  name: string;
  baseUrl?: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIConfig {
  providers: {
    gemini: AIProvider;
    huggingface: AIProvider;
    cohere: AIProvider;
    openai: AIProvider;
  };
  defaultProvider: keyof AIConfig["providers"];
  fallbackOrder: Array<keyof AIConfig["providers"]>;
}

// AI Configuration with free models
export const aiConfig: AIConfig = {
  providers: {
    // Google Gemini (Free tier: 15 requests per minute, 1500 requests per day)
    gemini: {
      name: "Google Gemini",
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
      model: "gemini-1.5-flash",
      maxTokens: 2048,
      temperature: 0.7,
    },

    // Hugging Face (Free tier with rate limits)
    huggingface: {
      name: "Hugging Face",
      baseUrl: "https://api-inference.huggingface.co/models",
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || "",
      model: "microsoft/DialoGPT-medium",
      maxTokens: 1024,
      temperature: 0.7,
    },

    // Cohere (Free tier: 100 API calls per month)
    cohere: {
      name: "Cohere",
      baseUrl: "https://api.cohere.ai/v1",
      apiKey: import.meta.env.VITE_COHERE_API_KEY || "",
      model: "command-light",
      maxTokens: 1024,
      temperature: 0.7,
    },

    // OpenAI (Backup - requires paid account but included for completeness)
    openai: {
      name: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
      model: "gpt-3.5-turbo",
      maxTokens: 1024,
      temperature: 0.7,
    },
  },

  // Primary provider (Gemini is most generous with free tier)
  defaultProvider: "gemini",

  // Fallback order if primary provider fails
  fallbackOrder: ["gemini", "huggingface", "cohere", "openai"],
};

// Validation function to check if API keys are configured
export const validateAIConfig = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  Object.entries(aiConfig.providers).forEach(([key, provider]) => {
    if (!provider.apiKey) {
      missing.push(key);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
};

// Get available providers (those with API keys configured)
export const getAvailableProviders = (): Array<keyof AIConfig["providers"]> => {
  return Object.entries(aiConfig.providers)
    .filter(([, provider]) => provider.apiKey)
    .map(([key]) => key) as Array<keyof AIConfig["providers"]>;
};
