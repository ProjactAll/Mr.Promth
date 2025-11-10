'use client'

import { useState, useRef } from 'react'
import { Upload, File, Folder, X } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  children?: FileItem[]
  uploadedAt: Date
}

export function FileExplorer() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'project-root',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'src',
          type: 'folder',
          children: [
            {
              id: '3',
              name: 'app.tsx',
              type: 'file',
              size: 1024,
              uploadedAt: new Date()
            }
          ],
          uploadedAt: new Date()
        }
      ],
      uploadedAt: new Date()
    }
  ])

  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray: FileItem[] = Array.from(newFiles).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'file',
      size: file.size,
      uploadedAt: new Date()
    }))

    setFiles(prev => [...prev, ...fileArray])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Explorer
          </h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Upload files"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-900/20' : 'hover:border-gray-500'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
          <p className="text-xs text-gray-400 mb-2">
            Drag & drop files here or click to upload
          </p>
          <p className="text-xs text-gray-600">
            Supports: .txt, .js, .ts, .py, .md, .json, .css, .html
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".txt,.js,.ts,.py,.md,.json,.css,.html"
        />
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-center py-8">
            <File className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-sm text-gray-500">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map(file => (
              <FileItemComponent
                key={file.id}
                file={file}
                onRemove={removeFile}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FileItemComponent({
  file,
  onRemove,
  formatFileSize
}: {
  file: FileItem
  onRemove: (id: string) => void
  formatFileSize: (bytes: number | undefined) => string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors group">
        {file.type === 'folder' ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Folder className="w-4 h-4" />
          </button>
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}

        <span className="flex-1 text-sm text-gray-300 truncate">
          {file.name}
        </span>

        {file.size && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatFileSize(file.size)}
          </span>
        )}

        <button
          onClick={() => onRemove(file.id)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/50 rounded transition-all"
          title="Remove file"
        >
          <X className="w-3 h-3 text-gray-500 hover:text-red-400" />
        </button>
      </div>

      {file.children && expanded && (
        <div className="ml-4 border-l-2 border-gray-700 pl-2">
          {file.children.map(child => (
            <FileItemComponent
              key={child.id}
              file={child}
              onRemove={onRemove}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      )}
    </div>
  )
}