"use client";

import { useState, useEffect } from 'react';
import { CodeEditor } from '@/components/code-editor/code-editor';
import { FileExplorer, FileNode } from '@/components/code-editor/file-explorer';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface ProjectEditorPageProps {
  params: { id: string };
}

export default function ProjectEditorPage({ params }: ProjectEditorPageProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${params.id}/files`);
      
      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const data = await response.json();
      setFiles(data.files || []);
      
      // Auto-select first file
      if (data.files && data.files.length > 0) {
        const firstFile = findFirstFile(data.files);
        if (firstFile) {
          handleFileSelect(firstFile);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node;
      }
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleFileSelect = async (file: FileNode) => {
    if (file.type === 'folder') return;

    try {
      setSelectedFile(file);
      
      // Load file content
      const response = await fetch(`/api/projects/${params.id}/files/${encodeURIComponent(file.path)}`);
      
      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      const data = await response.json();
      setFileContent(data.content || '');
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Failed to load file');
    }
  };

  const handleSave = async (content: string) => {
    if (!selectedFile) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/projects/${params.id}/files/${encodeURIComponent(selectedFile.path)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      toast.success('File saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'md': 'markdown',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'yml': 'yaml',
      'yaml': 'yaml',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar - File Explorer */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile?.path}
          />
        </div>
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={() => loadProject()}
            variant="outline"
            className="w-full"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {selectedFile && (
              <>
                <span className="text-sm text-gray-400">
                  {selectedFile.path}
                </span>
                {saving && (
                  <span className="text-xs text-blue-400">Saving...</span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSave(fileContent)}
              disabled={!selectedFile || saving}
              size="sm"
            >
              Save (Ctrl+S)
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <CodeEditor
              value={fileContent}
              onChange={setFileContent}
              language={getLanguageFromPath(selectedFile.path)}
              onSave={handleSave}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a file to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
