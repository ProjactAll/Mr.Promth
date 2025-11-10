"use client";

import { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, DocumentIcon, FolderIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile?: string;
}

export function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-800 ${
              isSelected ? 'bg-gray-700' : ''
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
            {isExpanded ? (
              <FolderOpenIcon className="w-4 h-4 text-blue-400" />
            ) : (
              <FolderIcon className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm text-gray-200">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-800 ${
          isSelected ? 'bg-gray-700' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 24}px` }}
        onClick={() => onFileSelect(node)}
      >
        <DocumentIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-200">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-900 overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">Files</h3>
      </div>
      <div className="py-1">
        {files.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
}
