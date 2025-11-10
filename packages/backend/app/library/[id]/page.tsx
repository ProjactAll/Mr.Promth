"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPrompt();
  }, [params.id]);

  async function fetchPrompt() {
    try {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setPrompt(data);

      // Initialize variables
      const vars: Record<string, string> = {};
      data.variables?.forEach((v: any) => {
        vars[v.name] = v.default_value || "";
      });
      setVariables(vars);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      toast.error("Failed to load prompt");
    } finally {
      setLoading(false);
    }
  }

  async function executePrompt() {
    setExecuting(true);
    setResult("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/prompt-templates/${params.id}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variables }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Execution failed");
      }

      const data = await response.json();
      setResult(data.result);
      toast.success("Execution completed!");

      // Refresh prompt to update usage count
      fetchPrompt();
    } catch (error) {
      console.error("Error executing prompt:", error);
      toast.error(error instanceof Error ? error.message : "Execution failed");
    } finally {
      setExecuting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Prompt not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">{prompt.name}</h1>
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
              {prompt.category}
            </span>
          </div>
          <p className="text-gray-600 text-lg mb-4">{prompt.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span> {prompt.average_rating?.toFixed(1) || "N/A"}</span>
            <span>•</span>
            <span>{prompt.usage_count || 0} uses</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Variables Input */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold mb-6">Input Variables</h2>
            
            {prompt.variables && prompt.variables.length > 0 ? (
              <div className="space-y-4">
                {prompt.variables.map((variable: any) => (
                  <div key={variable.name}>
                    <label className="block text-sm font-medium mb-2">
                      {variable.label}
                      {variable.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {variable.description && (
                      <p className="text-sm text-gray-500 mb-2">{variable.description}</p>
                    )}
                    {variable.type === "textarea" ? (
                      <Textarea
                        value={variables[variable.name] || ""}
                        onChange={(e) => setVariables({ ...variables, [variable.name]: e.target.value })}
                        placeholder={variable.placeholder || ""}
                        rows={4}
                      />
                    ) : (
                      <Input
                        type={variable.type || "text"}
                        value={variables[variable.name] || ""}
                        onChange={(e) => setVariables({ ...variables, [variable.name]: e.target.value })}
                        placeholder={variable.placeholder || ""}
                      />
                    )}
                  </div>
                ))}

                <Button
                  onClick={executePrompt}
                  disabled={executing}
                  className="w-full mt-6"
                  size="lg"
                >
                  {executing ? "Executing..." : " Execute Prompt"}
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">No variables required</p>
                <Button
                  onClick={executePrompt}
                  disabled={executing}
                  className="w-full"
                  size="lg"
                >
                  {executing ? "Executing..." : " Execute Prompt"}
                </Button>
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold mb-6">Result</h2>
            
            {result ? (
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(result)}
                  >
                     Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([result], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${prompt.name}-result.txt`;
                      a.click();
                    }}
                  >
                     Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Execute the prompt to see results here</p>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Template Preview */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold mb-4">Prompt Template</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{prompt.template}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
