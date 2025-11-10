"use client";

import { useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  height?: string;
  onSave?: (value: string) => void;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  theme = 'vs-dark',
  readOnly = false,
  height = '600px',
  onSave,
}: CodeEditorProps) {
  const [editorValue, setEditorValue] = useState(value);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add save keyboard shortcut (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const currentValue = editor.getValue();
      if (onSave) {
        onSave(currentValue);
      }
    });

    // Focus editor
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    setEditorValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full h-full border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        language={language}
        value={editorValue}
        theme={theme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
