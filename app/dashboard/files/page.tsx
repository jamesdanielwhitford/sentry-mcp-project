// app/dashboard/files/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Grid, List, Filter } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/types";
import { FileCard } from "@/components/dashboard/file-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function FilesPage() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [filterType, setFilterType] = useState<"all" | "image" | "document">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewFile, setPreviewFile] = useState<FileUpload | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    let filtered = files.filter(file => 
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(file => {
        if (filterType === "image") return file.type.startsWith("image/");
        if (filterType === "document") return file.type === "application/pdf" || file.type.startsWith("text/");
        return true;
      });
    }

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "size":
          return b.size - a.size;
        case "date":
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    setFilteredFiles(filtered);
  }, [files, searchTerm, sortBy, filterType]);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/user/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/user/files?id=${fileId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete file");
    }
  };

  const handlePreview = (file: FileUpload) => {
    setPreviewFile(file);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Files</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your uploaded files ({files.length} total)
            </p>
          </div>
          <Link href="/dashboard/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchTerm || filterType !== "all" ? (
                  <Filter className="mx-auto h-12 w-12" />
                ) : (
                  <Plus className="mx-auto h-12 w-12" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== "all" ? "No files found" : "No files uploaded"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by uploading your first file"
                }
              </p>
              {!searchTerm && filterType === "all" && (
                <Link href="/dashboard/upload">
                  <Button>Upload Files</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile.originalName}
          size="lg"
        >
          <div className="text-center">
            {previewFile.type.startsWith('image/') ? (
              <img
                src={previewFile.url}
                alt={previewFile.originalName}
                className="max-w-full max-h-96 mx-auto rounded-lg"
              />
            ) : (
              <div className="p-8 text-gray-500">
                <p>Preview not available for this file type</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewFile.url;
                    link.download = previewFile.originalName;
                    link.click();
                  }}
                >
                  Download File
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}