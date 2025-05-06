'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Image as ImageIcon } from 'lucide-react';

interface OptionalFieldsProps {
  name: string;
  setName: (value: string) => void;
  mobile: string;
  setMobile: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  transactionStatus: string;
  setTransactionStatus: (value: string) => void;
  files: File[];
  setFiles: (value: File[]) => void;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
  videoPreview: string | null;
  setVideoPreview: (value: string | null) => void;
  speechField: string;
  setSpeechField: (value: string) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  setError: (value: string) => void;
  startSpeechRecognition: (field: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  error: string;
  platforms: string[];
  purpose: string;
}

export default function OptionalFields({
  name,
  setName,
  mobile,
  setMobile,
  source,
  setSource,
  type,
  setType,
  transactionStatus,
  setTransactionStatus,
  files,
  setFiles,
  imagePreview,
  setImagePreview,
  videoPreview,
  setVideoPreview,
  speechField,
  setSpeechField,
  isRecording,
  setIsRecording,
  setError,
  startSpeechRecognition,
  handleSubmit,
  error,
  platforms,
  purpose,
}: OptionalFieldsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...newFiles]);

      const file = newFiles[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreview, videoPreview]);

  return (
    <form onSubmit={handleSubmit} className="column">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Thông tin khách hàng</h2>
      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 font-bold">
            Tên khách hàng
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên khách hàng..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('name')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'name' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'name' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Mobile */}
        <div>
          <Label htmlFor="mobile" className="text-gray-700 dark:text-gray-200 font-bold">
            Số điện thoại
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('mobile')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'mobile' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'mobile' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Source */}
        <div>
          <Label htmlFor="source" className="text-gray-700 dark:text-gray-200 font-bold">
            Nguồn biết tin
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Nhập nguồn biết tin..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('source')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'source' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'source' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Type */}
        <div>
          <Label htmlFor="type" className="text-gray-700 dark:text-gray-200 font-bold">
            Loại khách hàng
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Nhập loại khách hàng..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('type')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'type' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'type' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Transaction Status */}
        <div>
          <Label htmlFor="transactionStatus" className="text-gray-700 dark:text-gray-200 font-bold">
            Tình trạng giao dịch
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="transactionStatus"
              value={transactionStatus}
              onChange={(e) => setTransactionStatus(e.target.value)}
              placeholder="Nhập tình trạng giao dịch..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('transactionStatus')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'transactionStatus' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'transactionStatus' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="file-upload" className="text-gray-700 dark:text-gray-200 font-bold">
            Ảnh bìa bài đăng
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            <ImageIcon className="ml-2 w-5 h-5 text-gray-700" />
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Image Preview"
              className="mt-2 w-32 h-32 object-cover rounded-md"
            />
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white"
          disabled={!platforms.length || !purpose}
        >
          Đăng bài
        </Button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </form>
  );
}