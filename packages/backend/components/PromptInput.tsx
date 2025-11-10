'use client'

import { FormEvent, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, Github, Sparkles, MessageSquare, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PromptInputProps {
  onGenerate: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
}

type Mode = 'agent' | 'chat' | 'auto';

export function PromptInput({ onGenerate, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    await onGenerate(trimmed);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleGitHubImport = async () => {
    const url = prompt('Enter GitHub repository URL (e.g., https://github.com/user/repo):');
    
    if (!url) return;
    
    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import repository');
      }
      
      const data = await response.json();
      
      // Add imported files to attached files
      if (data.files && data.files.length > 0) {
        alert(`Successfully imported ${data.files.length} files from ${data.repository}`);
        // You can process the files here if needed
      }
    } catch (error) {
      console.error('GitHub import error:', error);
      alert(error instanceof Error ? error.message : 'Failed to import repository');
    }
  };

  const examplePrompts = [
    'สร้างเว็บ e-commerce สำหรับคาเฟ่ มีระบบสั่ง preorder และสะสมแต้มสมาชิก',
    'ออกแบบแพลตฟอร์มจัดตารางเรียนออนไลน์ พร้อมระบบชำระเงินและ dashboard ครู',
    'สร้าง landing page สำหรับ startup ด้านสุขภาพ พร้อมบล็อกและระบบนัดหมายแพทย์',
  ];

  const getModeIcon = (m: Mode) => {
    switch (m) {
      case 'agent': return <Sparkles className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'auto': return <Zap className="h-4 w-4" />;
    }
  };

  const getModeLabel = (m: Mode) => {
    switch (m) {
      case 'agent': return 'Agent Mode';
      case 'chat': return 'Chat Mode';
      case 'auto': return 'Auto Mode';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="mr-promth-prompt" className="text-sm font-medium text-muted-foreground">
            บอก AI ว่าคุณต้องการอะไร
          </label>
          
          {/* Mode Selector */}
          <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <SelectTrigger className="w-[160px] h-8">
              <div className="flex items-center gap-2">
                {getModeIcon(mode)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Auto Mode
                </div>
              </SelectItem>
              <SelectItem value="agent">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Agent Mode
                </div>
              </SelectItem>
              <SelectItem value="chat">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat Mode
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <textarea
          id="mr-promth-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="ตัวอย่าง: สร้างเว็บสำหรับเวิร์คช็อปสอนทำขนม มีระบบจองรอบและเก็บอีเมลลูกค้า"
          className="mt-3 w-full resize-y rounded-2xl border border-border/80 bg-card/90 px-4 py-3 text-base leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
          rows={8}
          disabled={isLoading}
        />

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1 text-sm"
              >
                <Paperclip className="h-3 w-3" />
                <span className="text-muted-foreground">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFileAttach}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              แนบไฟล์
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGitHubImport}
              disabled={isLoading}
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                กำลังสร้าง...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                สร้างเว็บไซต์
              </>
            )}
          </Button>
        </div>



        {/* Mode Description */}
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
          {mode === 'auto' && (
            <p>🤖 <strong>Auto Mode:</strong> AI จะเลือกโหมดที่เหมาะสมให้อัตโนมัติ (แนะนำ)</p>
          )}
          {mode === 'agent' && (
            <p> <strong>Agent Mode:</strong> ใช้ระบบ Agent สร้างเว็บไซต์สมบูรณ์</p>
          )}
          {mode === 'chat' && (
            <p> <strong>Chat Mode:</strong> คุยกับ AI แบบธรรมดา ถามตอบทั่วไป</p>
          )}
        </div>
      </div>
    </form>
  );
}
