'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, FileText, File as FileIcon, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Dash() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalSize =
      selectedFiles.reduce((acc, file) => acc + file.size, 0) +
      files.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > 20 * 1024 * 1024) {
      alert('Total file size exceeds 20MB limit.');
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const handleDelete = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else if (
      fileType === 'application/vnd.ms-powerpoint' ||
      file.name.endsWith('.ppt') ||
      file.name.endsWith('.pptx')
    ) {
      return <FileText className="w-6 h-6 text-orange-500" />;
    } else if (fileType === 'text/plain') {
      return <FileText className="w-6 h-6 text-gray-500" />;
    } else {
      return <FileIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Upload Button */}
      <div>
        <label
          htmlFor="file-upload"
          className="flex items-center cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition duration-300 ease-in-out"
        >
          <Upload className="mr-2" size={16} />
          <span>Upload Files</span>
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileUpload}
          accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,image/*"
        />
      </div>

      {/* List of Uploaded Files */}
      {files.length > 0 && (
        <div className="w-full max-w-md">
          <ScrollArea className=" border rounded-md m-4">
            <div className="divide-y">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center">
                    {getFileIcon(file)}
                    <span
                      className="ml-3 text-sm text-gray-800 truncate max-w-[150px]"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
