// components/dashboard/file-upload.tsx
"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string;
  disabled?: boolean;
}

interface FilePreview {
  file: File;
  id: string;
}

export function FileUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*,application/pdf,text/plain",
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): boolean => {
    const validTypes = accept.split(',').map(type => type.trim());
    const isValidType = validTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'text/*') return file.type.startsWith('text/');
      return file.type === type;
    });

    if (!isValidType) {
      setErrors(prev => [...prev, `${file.name}: Invalid file type`]);
      return false;
    }

    if (file.size > maxSize) {
      setErrors(prev => [...prev, `${file.name}: File too large (max ${formatFileSize(maxSize)})`]);
      return false;
    }

    return true;
  };

  const addFiles = useCallback((newFiles: FileList) => {
    setErrors([]);
    const fileArray = Array.from(newFiles);
    const validFiles: FilePreview[] = [];

    fileArray.forEach(file => {
      if (files.length + validFiles.length >= maxFiles) {
        setErrors(prev => [...prev, `Maximum ${maxFiles} files allowed`]);
        return;
      }

      if (validateFile(file)) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(7)
        });
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, maxSize, accept]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  }, [addFiles, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
    return File;
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    onUpload(files.map(f => f.file));
    setFiles([]);
    setErrors([]);
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-400'}
        `}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500">
          Max {maxFiles} files, up to {formatFileSize(maxSize)} each
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, idx) => (
            <p key={idx} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-Gray-900">Files to upload ({files.length})</h4>
          <div className="space-y-2">
            {files.map(({ file, id }) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
          <Button onClick={handleUpload} disabled={disabled}>
            Upload {files.length} file{files.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}