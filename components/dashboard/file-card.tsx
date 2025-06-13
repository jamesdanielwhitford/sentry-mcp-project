// components/dashboard/file-card.tsx
"use client";

import { useState } from "react";
import { MoreVertical, Download, Trash2, Eye, FileText, Image, File } from "lucide-react";
import { FileUpload } from "@/types";
import { formatFileSize, formatDate } from "@/lib/utils";
import { ConfirmModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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
    return 'text-muted-foreground';
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
      <div className="group bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <FileIcon className={`h-6 w-6 ${iconColor}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-card-foreground truncate" title={file.originalName}>
                  {file.originalName}
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-10 animate-in">
                  <div className="py-2">
                    {file.type.startsWith('image/') && onPreview && (
                      <button
                        onClick={handlePreview}
                        className="flex items-center w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        Preview
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      className="flex items-center w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
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
                        className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
          
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {file.type.split('/')[0]}
              </span>
              {file.type.startsWith('image/') && onPreview && (
                <button
                  onClick={handlePreview}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>
        
        {file.type.startsWith('image/') && onPreview && (
          <div 
            className="h-32 bg-muted cursor-pointer hover:bg-muted/80 transition-colors rounded-b-xl overflow-hidden"
            onClick={handlePreview}
          >
            <img
              src={file.url}
              alt={file.originalName}
              className="w-full h-full object-cover"
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