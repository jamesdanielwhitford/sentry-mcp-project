// components/dashboard/recent-files.tsx
import Link from "next/link";
import { File, Image, FileText } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { FileUpload } from "@/types";

interface RecentFilesProps {
  files: FileUpload[];
}

export function RecentFiles({ files }: RecentFilesProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
    return File;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
          <Link
            href="/dashboard/files"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        
        {files.length === 0 ? (
          <div className="text-center py-8">
            <File className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first file.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Upload File
              </Link>
            </div>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <li key={file.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.originalName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {file.type.split('/')[0]}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}