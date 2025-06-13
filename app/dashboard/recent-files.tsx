// app/dashboard/recent-files.tsx
import Link from "next/link";
import { File, Image, FileText, Upload } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { FileUpload } from "@/types";
import { Button } from "@/components/ui/button";

interface RecentFilesProps {
  files: FileUpload[];
}

export function RecentFiles({ files }: RecentFilesProps) {
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

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">Recent Files</h3>
          <Link href="/dashboard/files">
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </div>
        
        {files.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <File className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">No files uploaded</h3>
            <p className="text-muted-foreground mb-6">Get started by uploading your first file.</p>
            <Link href="/dashboard/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const iconColor = getFileIconColor(file.type);
              return (
                <div key={file.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileIcon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {file.type.split('/')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}