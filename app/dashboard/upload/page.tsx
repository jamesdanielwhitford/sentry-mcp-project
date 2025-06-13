// app/dashboard/upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/dashboard/file-upload";
import { Button } from "@/components/ui/button";

interface UploadResult {
  success: boolean;
  fileName: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setResults([]);
    
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
          return {
            success: true,
            fileName: file.name,
            message: 'Upload successful'
          };
        } else {
          // BUG: Display confusing error messages for 413 errors
          // This will help demonstrate the investigation process
          let errorMessage = data.error || 'Upload failed';
          
          if (response.status === 413) {
            // Make the error message confusing - don't mention the real 3MB limit
            errorMessage = 'File upload failed - server error. Please try again.';
          }
          
          return {
            success: false,
            fileName: file.name,
            message: errorMessage,
            error: {
              status: response.status,
              originalError: data.error
            }
          };
        }
      } catch (error) {
        return {
          success: false,
          fileName: file.name,
          message: 'Network error - please check your connection',
          error: error
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    setResults(results);
    setShowResults(true);
    setUploading(false);
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage your files securely
        </p>
      </div>

      {!showResults ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Choose Files to Upload</h2>
            <p className="text-sm text-gray-500">
              Supported formats: Images (JPG, PNG, GIF), PDF, Text files. Maximum 5MB per file.
            </p>
          </div>
          
          <FileUpload
            onUpload={handleUpload}
            maxFiles={10}
            maxSize={5 * 1024 * 1024} // BUG: Still advertises 5MB limit
            accept="image/*,application/pdf,text/plain"
            disabled={uploading}
          />
          
          {uploading && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-gray-600">Uploading files...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">Upload Results</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    {successCount} file{successCount !== 1 ? 's' : ''} uploaded successfully
                  </span>
                </div>
              </div>
              
              {errorCount > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      {errorCount} file{errorCount !== 1 ? 's' : ''} failed to upload
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{result.fileName}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </span>
                    {/* BUG: Show additional confusing technical details for debugging */}
                    {!result.success && result.error && (
                      <span className="text-xs text-gray-400 mt-1">
                        Status: {result.error.status || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* BUG: Add a confusing help text that doesn't help users understand the real issue */}
            {errorCount > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Having trouble with uploads?</p>
                    <p>Some files may fail due to server limitations. Try uploading smaller files or contact support if the issue persists.</p>
                    <p className="text-xs mt-2 text-yellow-600">
                      Note: Files should be under 5MB and in supported formats.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setResults([]);
                }}
              >
                Upload More Files
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard/files')}
              >
                View All Files
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}