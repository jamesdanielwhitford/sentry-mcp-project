// components/dashboard/file-card.tsx
"use client";

import { useState } from "react";
import { MoreVertical, Download, Trash2, Eye, FileText, Image, File } from "lucide-react";
import { FileUpload } from "@/types";
import { formatFileSize, formatDate } from "@/lib/utils";
import { ConfirmModal } from "@/components/ui/modal";

interface FileCardProps {
  file: FileUpload;
  onDelete?: (fileId: string) => void;
  onPreview?: (file: FileUpload) => void;
}

export function FileCard({ file, onDelete, onPreview }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
    return File;
  };

  const getFileIconColor = (type: string) => {
    if (type.startsWith('image/')) return 'text-green-500';
    if (type === 'application/pdf') return 'text-red-500';
    if (type.startsWith('text/')) return 'text-blue-500';
    return 'text-gray-500';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(file.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(file);
    }
    setShowMenu(false);
  };

  const FileIcon = getFileIcon(file.type);
  const iconColor = getFileIconColor(file.type);

  return (
    <>
      <div className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 ${iconColor}`}>
                <FileIcon className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                  {file.originalName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    {file.type.startsWith('image/') && onPreview && (
                      <button
                        onClick={handlePreview}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        Preview
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Download
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {file.type.split('/')[0]}
              </span>
              {file.type.startsWith('image/') && (
                <div className="text-xs text-gray-500">
                  Click to preview
                </div>
              )}
            </div>
          </div>
        </div>
        
        {file.type.startsWith('image/') && onPreview && (
          <div 
            className="h-32 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handlePreview}
          >
            <img
              src={file.url}
              alt={file.originalName}
              className="w-full h-full object-cover rounded-b-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${file.originalName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}