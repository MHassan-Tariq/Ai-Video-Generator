import React, { useState } from "react"
import { uploadFile } from "@/lib/storage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud, FileIcon, ImageIcon, X } from "lucide-react"

interface UploadFieldProps {
  storagePath: string
  accept?: string
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function UploadField({ storagePath, accept = "image/jpeg,image/png", value, onChange, disabled }: UploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setProgress(0)
      
      const downloadURL = await uploadFile(storagePath, file, (p) => {
        setProgress(Math.round(p))
      })
      
      onChange(downloadURL)
    } catch (error) {
      console.error("Upload failed", error)
      alert("Failed to upload file.")
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    // Note: this just removes it from the form state. 
    // Actual Firebase Storage deletion could be handled here or on form save/delete.
    onChange("")
  }

  const isImage = value?.match(/\.(jpeg|jpg|gif|png|webp)/i) || value?.includes("alt=media")

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative border rounded-lg p-2 flex flex-col items-center justify-center bg-secondary/50 group">
          {isImage ? (
            <img 
              src={value} 
              alt="Uploaded file" 
              className="max-h-48 w-full object-contain rounded"
            />
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground w-full">
              <FileIcon className="h-12 w-12 mb-2" />
              <span className="text-sm truncate max-w-full px-4">{value.split('?')[0].split('/').pop()}</span>
            </div>
          )}
          
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:bg-secondary/50 transition-colors">
          <Input 
            type="file" 
            accept={accept} 
            onChange={handleFileChange} 
            disabled={disabled || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">{progress}% Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <UploadCloud className="h-8 w-8" />
              <span className="text-sm font-medium">Click or drag file to upload</span>
              <span className="text-xs">Supports: {accept}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
