"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, File, Image } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FileUploadProps {
  label: string;
  currentFile?: string;
  onFileChange: (fileUrl: string | null) => void;
  fileType: string;
  productId: string;
  tableName: string;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  label,
  currentFile,
  onFileChange,
  fileType,
  productId,
  tableName,
  accept = "*/*",
  maxSize = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${tableName}/${productId}/${fileType}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        alert("Error uploading file: " + error.message);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-assets")
        .getPublicUrl(filePath);

      setPreview(urlData.publicUrl);
      onFileChange(urlData.publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceFile = () => {
    fileInputRef.current?.click();
  };

  const isImage = preview && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(preview);

  return (
    <div className="space-y-4">
      <Label htmlFor="file-upload">{label}</Label>

      {preview ? (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            {isImage ? (
              <Image className="h-8 w-8 text-blue-500" />
            ) : (
              <File className="h-8 w-8 text-gray-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {preview?.split("/").pop() || "Unknown file"}
              </p>
              <p className="text-xs text-gray-500 truncate">{preview}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReplaceFile}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isImage && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-32 object-contain rounded border"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">No file selected</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Choose File"}
          </Button>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <p className="text-xs text-gray-500">Max file size: {maxSize}MB</p>
    </div>
  );
}
