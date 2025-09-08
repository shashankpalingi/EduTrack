import React, { useState, useEffect } from "react";
import {
  Settings,
  Key,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import aiService from "../../services/aiService";
import { aiConfig } from "../../services/aiConfig";

interface APIKeyConfig {
  name: string;
  key: string;
  envVar: string;
  status: "configured" | "missing" | "testing";
  description: string;
  freeInfo: string;
  signupUrl: string;
  docsUrl: string;
}

const apiConfigs: APIKeyConfig[] = [
  {
    name: "Google Gemini",
    key: "VITE_GEMINI_API_KEY",
    envVar: "VITE_GEMINI_API_KEY",
    status: "missing",
    description:
      "Most generous free tier with 15 requests/minute and 1,500 requests/day",
    freeInfo: "Free: 15 RPM, 1,500 RPD",
    signupUrl: "https://ai.google.dev/",
    docsUrl: "https://ai.google.dev/docs",
  },
  {
    name: "Hugging Face",
    key: "VITE_HUGGINGFACE_API_KEY",
    envVar: "VITE_HUGGINGFACE_API_KEY",
    status: "missing",
    description:
      "Free inference API with rate limits, good for various NLP tasks",
    freeInfo: "Free: Rate limited",
    signupUrl: "https://huggingface.co/join",
    docsUrl: "https://huggingface.co/docs/api-inference/index",
  },
  {
    name: "Cohere",
    key: "VITE_COHERE_API_KEY",
    envVar: "VITE_COHERE_API_KEY",
    status: "missing",
    description: "Free trial with 100 API calls per month for text generation",
    freeInfo: "Free: 100 calls/month",
    signupUrl: "https://dashboard.cohere.ai/welcome/register",
    docsUrl: "https://docs.cohere.ai/",
  },
  {
    name: "OpenAI",
    key: "VITE_OPENAI_API_KEY",
    envVar: "VITE_OPENAI_API_KEY",
    status: "missing",
    description: "Premium service (requires payment after free credits expire)",
    freeInfo: "Free: $5 credit for new users",
    signupUrl: "https://platform.openai.com/signup",
    docsUrl: "https://platform.openai.com/docs",
  },
];

interface AIConfigurationProps {
  className?: string;
}

export const AIConfiguration: React.FC<AIConfigurationProps> = ({
  className = "",
}) => {
  const [configs, setConfigs] = useState<APIKeyConfig[]>(apiConfigs);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string>("");

  useEffect(() => {
    // Check which API keys are configured
    const updatedConfigs = apiConfigs.map((config) => ({
      ...config,
      status: (import.meta.env[config.envVar] ? "configured" : "missing") as
        | "configured"
        | "missing"
        | "testing",
    }));
    setConfigs(updatedConfigs);
  }, []);

  const testProvider = async (providerKey: string) => {
    setTestingProvider(providerKey);

    try {
      const response = await aiService.getResponse(
        "Test question: What is 2+2?",
      );

      setConfigs((prev) =>
        prev.map((config) =>
          config.key === providerKey
            ? { ...config, status: response.success ? "configured" : "missing" }
            : config,
        ),
      );
    } catch (error) {
      console.error(`Test failed for ${providerKey}:`, error);
    } finally {
      setTestingProvider("");
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const configStatus = aiService.getConfigurationStatus();

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <CardTitle>AI Configuration</CardTitle>
            </div>
            <Badge
              variant={configStatus.hasAnyProvider ? "default" : "secondary"}
            >
              {configStatus.configured}/{configStatus.total} Configured
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Configure AI providers to enable the doubt assistant and quiz
            generator
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="providers">API Providers</TabsTrigger>
          <TabsTrigger value="testing">Test & Status</TabsTrigger>
        </TabsList>

        {/* Setup Guide Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need at least one AI provider API key to use the AI
                  features. We recommend starting with Google Gemini as it has
                  the most generous free tier.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">Step-by-step setup:</h3>

                <div className="space-y-3 pl-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Choose an AI provider</p>
                      <p className="text-sm text-gray-600">
                        Google Gemini is recommended for beginners (most
                        generous free tier)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Sign up and get API key</p>
                      <p className="text-sm text-gray-600">
                        Create an account with your chosen provider and generate
                        an API key
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">
                        Add to environment variables
                      </p>
                      <p className="text-sm text-gray-600">
                        Create a <code>.env</code> file in your project root and
                        add your API key
                      </p>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono">
                        VITE_GEMINI_API_KEY=your_api_key_here
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">
                        Restart your development server
                      </p>
                      <p className="text-sm text-gray-600">
                        Stop and restart your dev server to load the new
                        environment variables
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Environment Variables Format:</h3>
                <div className="p-3 bg-gray-100 rounded text-sm font-mono space-y-1">
                  <div># Google Gemini (Recommended)</div>
                  <div>VITE_GEMINI_API_KEY=your_gemini_key</div>
                  <div></div>
                  <div># Hugging Face (Optional)</div>
                  <div>VITE_HUGGINGFACE_API_KEY=your_hf_key</div>
                  <div></div>
                  <div># Cohere (Optional)</div>
                  <div>VITE_COHERE_API_KEY=your_cohere_key</div>
                  <div></div>
                  <div># OpenAI (Optional - requires payment)</div>
                  <div>VITE_OPENAI_API_KEY=your_openai_key</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4">
            {configs.map((config) => (
              <Card key={config.key} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <Badge
                        variant={
                          config.status === "configured"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {config.status === "configured"
                          ? "Configured"
                          : "Not Set"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(config.docsUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Docs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(config.signupUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Sign Up
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{config.description}</p>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {config.freeInfo}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={config.key}>Environment Variable</Label>
                    <div className="flex gap-2">
                      <Input
                        id={config.key}
                        type={showKeys[config.key] ? "text" : "password"}
                        value={import.meta.env[config.envVar] || ""}
                        placeholder={`Add ${config.envVar} to your .env file`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility(config.key)}
                      >
                        {showKeys[config.key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Add this to your .env file:{" "}
                      <code>{config.envVar}=your_api_key_here</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Provider Status & Testing
              </CardTitle>
              <p className="text-sm text-gray-600">
                Test your configured AI providers to ensure they're working
                correctly
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {config.status === "configured" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">{config.name}</span>
                      </div>
                      <Badge
                        variant={
                          config.status === "configured"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {config.status === "configured"
                          ? "Ready"
                          : "Not Configured"}
                      </Badge>
                    </div>

                    {config.status === "configured" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testProvider(config.key)}
                        disabled={testingProvider === config.key}
                      >
                        {testingProvider === config.key
                          ? "Testing..."
                          : "Test Connection"}
                      </Button>
                    )}
                  </div>
                ))}

                {!configStatus.hasAnyProvider && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No AI providers are configured. Please add at least one
                      API key to enable AI features.
                    </AlertDescription>
                  </Alert>
                )}

                {configStatus.hasAnyProvider && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      AI features are enabled! You have{" "}
                      {configStatus.configured} provider
                      {configStatus.configured !== 1 ? "s" : ""} configured.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIConfiguration;
