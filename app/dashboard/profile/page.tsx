// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Calendar, Files, HardDrive, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize, formatDate } from "@/lib/utils";
import { UserProfile } from "@/types";

export default function ProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setProfile(prev => prev ? { ...prev, name: updatedUser.name } : null);
        setSuccess(true);
        
        // Update the session
        await update({ name: updatedUser.name });
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  const totalFileSize = profile.files.reduce((total, file) => total + file.size, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{profile.name || "Anonymous User"}</h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
                
                <Input
                  label="Email Address"
                  value={profile.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                {success && (
                  <span className="text-sm text-green-600">Profile updated successfully!</span>
                )}
                <div className="ml-auto">
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={!name.trim() || name === profile.name}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Files className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Total Files</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{profile.files.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Storage Used</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatFileSize(totalFileSize)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-600">Member Since</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(profile.createdAt).split(',')[0]}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            
            {profile.files.length === 0 ? (
              <p className="text-sm text-gray-500">No files uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {profile.files.slice(0, 5).map((file) => (
                  <div key={file.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 truncate" title={file.originalName}>
                      {file.originalName}
                    </span>
                    <span className="text-gray-500 flex-shrink-0 ml-2">
                      {formatDate(file.uploadedAt).split(',')[0]}
                    </span>
                  </div>
                ))}
                {profile.files.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500">
                      and {profile.files.length - 5} more files
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}