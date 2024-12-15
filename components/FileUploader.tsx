"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { Thumbnail } from '@/components/Thumbnail';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { MAX_FILE_SIZE } from '@/constans';

import { cn, convertFileToUrl } from '@/lib/utils';
import { getFileType } from '@/lib/utils';
import { uploadFile } from '@/lib/actions/file.actions';
import { useToast } from '@/hooks/use-toast';

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

export const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);

    const uploadPromises = acceptedFiles.map(async (file) => {
      if (file.size > MAX_FILE_SIZE ) {
        setFiles((prevFiles) => 
          prevFiles.filter((f) => f.name !== file.name));
        
        return toast({
          description: (
            <p className="body-2 text-white">
              <span className="font-semibold">
                {file.name}
              </span> is too large. Max file size is 50MB
            </p>
          ), className: "error-toast"
        });

        await Promise.all(uploadPromises);
      }

      return uploadFile({ file, ownerId, accountId, path }).then((uploadedFile) => {
        if (uploadedFile) {
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
        }
      });
    });
  }, [ownerId, accountId, path, toast]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>, 
    fileName: string
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button 
        type="button" 
        className={cn("uploader-button")}
      >
        <Image 
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />
        {" "}
        <p>Upload</p>
      </Button>

      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li key={`${file.name}-${index}`} className="uploader-preview-item">
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <div className="preview-item-name">
                    {file.name}
                    <Image 
                      src="/assets/icons/file-loader.gif"
                      width={50}
                      height={26}
                      alt="loader"
                    />
                  </div>
                </div>

                <Image 
                  src="/assets/icons/remove.svg"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                  alt="remove"
                  width={24}
                  height={24}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}