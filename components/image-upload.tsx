'use client';

import { CameraIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        // TODO: upload `formData` to storage and call onChange(uploadedUrl)
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    disabled: disabled || loading,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 transition-colors hover:bg-muted/50"
    >
      <input {...getInputProps()} />
      
      {value ? (
        <img
          src={value}
          alt="Profile picture"
          className="h-32 w-32 rounded-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <CameraIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {loading ? 'Uploading...' : 'Click or drag image here'}
          </p>
        </div>
      )}
    </div>
  );
} 