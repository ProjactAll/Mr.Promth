"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface Prompt {
  id: string;
  title: string;
  description: string | null;
  content: string;
  tags: string[] | null;
  updated_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error("Failed to fetch prompts");
  }
  return res.json();
});

export default function PromptsPage() {
  const { data, isLoading, mutate } = useSWR<{ data: Prompt[] }>("/api/prompts", fetcher);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prompts = useMemo(() => data?.data ?? [], [data]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState({ title: "", description: "", content: "", tags: "" });
  };

  const handleSubmit = async () => {
    if (!formState.title.trim() || !formState.content.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formState.title.trim(),
          description: formState.description.trim() || undefined,
          content: formState.content.trim(),
          tags: formState.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create prompt");
      }

      await mutate();
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Delete this prompt?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete prompt");
      }

      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Prompt Library</h2>
          <p className="text-sm text-muted-foreground">Create reusable prompt templates for your projects.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Prompt</Button>
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading prompts…</span>
        </div>
      ) : prompts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-12 text-center">
          <h3 className="text-lg font-medium">No prompts yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Build your prompt catalog to share across sessions. Click &ldquo;New Prompt&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{prompt.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {new Date(prompt.updated_at).toLocaleDateString()}
                  </span>
                </CardTitle>
                {prompt.description ? <CardDescription>{prompt.description}</CardDescription> : null}
              </CardHeader>
              <CardContent>
                <pre className="max-h-40 overflow-y-auto rounded bg-black/30 p-4 text-xs text-foreground">
                  {prompt.content}
                </pre>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(prompt.tags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(prompt.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="New Prompt"
        description="Create a reusable template for your future sessions."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Save Prompt
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            name="title"
            placeholder="Title"
            value={formState.title}
            onChange={handleChange}
          />
          <Input
            name="description"
            placeholder="Short description"
            value={formState.description}
            onChange={handleChange}
          />
          <textarea
            name="content"
            placeholder="Prompt content"
            value={formState.content}
            onChange={handleChange}
            className="h-40 w-full resize-y rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Input
            name="tags"
            placeholder="Tags (comma separated)"
            value={formState.tags}
            onChange={handleChange}
          />
        </div>
      </Modal>
    </div>
  );
}
