'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mic, Image as ImageIcon, Video } from 'lucide-react';

interface MiddleColumnProps {
  name: string;
  mobile: string;
  leadSource: string;
  customerType: string;
  transactionStatus: string;
  setName: (value: string) => void;
  setMobile: (value: string) => void;
  setLeadSource: (value: string) => void;
  setCustomerType: (value: string) => void;
  setTransactionStatus: (value: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
  videoPreview: string | null;
  setVideoPreview: (value: string | null) => void;
  error: string;
  setError: (value: string) => void;
}

export default function MiddleColumn({
  name,
  mobile,
  leadSource,
  customerType,
  transactionStatus,
  setName,
  setMobile,
  setLeadSource,
  setCustomerType,
  setTransactionStatus,
  files,
  setFiles,
  imagePreview,
  setImagePreview,
  videoPreview,
  setVideoPreview,
  error,
  setError,
}: MiddleColumnProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [speechField, setSpeechField] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Speech-to-text
  const startSpeechRecognition = (field: string) => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Trình duyệt không hỗ trợ Speech Recognition');
      return;
    }

    setSpeechField(field);
    setIsRecording(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      switch (field) {
        case 'name':
          setName(name + (name ? ' ' : '') + transcript);
          break;
        case 'mobile':
          setMobile(mobile + (mobile ? ' ' : '') + transcript);
          break;
        case 'customerType':
          setCustomerType(customerType + (customerType ? ' ' : '') + transcript);
          break;
        case 'transactionStatus':
          setTransactionStatus(transactionStatus + (transactionStatus ? ' ' : '') + transcript);
          break;
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  // Handle file upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.png'], 'video/*': ['.mp4', '.mpeg'] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        if (fileRejections[0].errors[0].code === 'too-many-files') {
          setError('Chỉ được upload 1 file');
          return;
        }
      }
      const validFiles = acceptedFiles.filter((file) => {
        const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
        if (!validTypes.includes(file.type)) {
          setError('Chỉ hỗ trợ JPEG, PNG, MP4, MPEG');
          return false;
        }
        if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
          setError('Ảnh phải dưới 5MB');
          return false;
        }
        if (file.type.startsWith('video/') && file.size > 20 * 1024 * 1024) {
          setError('Video phải dưới 20MB');
          return false;
        }
        return true;
      });
      setFiles(validFiles);
      if (validFiles.length > 0) {
        const file = validFiles[0];
        if (file.type.startsWith('image/')) {
          setImagePreview(URL.createObjectURL(file));
          setVideoPreview(null);
        } else if (file.type.startsWith('video/')) {
          setVideoPreview(URL.createObjectURL(file));
          setImagePreview(null);
        }
      } else {
        setImagePreview(null);
        setVideoPreview(null);
      }
      setError('');
    },
  });

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-h-[600px]">
      {/* File Upload */}
      <div>
        <Label className="text-gray-700 dark:text-gray-200">
          Tải ảnh/video lên (Ảnh dưới 5 MB, Video dưới 20 MB)
        </Label>
        <div
          {...getRootProps()}
          className={`mt-1 border-2 border-dashed border-gray-300 p-4 rounded-md text-center ${
            isDragActive ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          <input {...getInputProps()} />
          <p>Kéo thả ảnh/video hoặc click để upload</p>
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between text-sm text-gray-600 mt-2"
            >
              <p>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <Button
                type="button"
                onClick={() => setFiles([])}
                variant="destructive"
                size="sm"
              >
                Xóa
              </Button>
            </div>
          ))}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 max-w-xs rounded mx-auto"
            />
          )}
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-2 max-w-xs rounded mx-auto"
            />
          )}
        </div>
      </div>

      {/* Name */}
      <div className="mt-4">
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">
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
            className="ml-2"
            variant={isRecording && speechField === 'name' ? 'destructive' : 'default'}
          >
            <Mic className="w-5 h-5" />
            {isRecording && speechField === 'name' ? 'Đang ghi...' : 'Ghi âm'}
          </Button>
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-4">
        <Label htmlFor="mobile" className="text-gray-700 dark:text-gray-200">
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
            className="ml-2"
            variant={isRecording && speechField === 'mobile' ? 'destructive' : 'default'}
          >
            <Mic className="w-5 h-5" />
            {isRecording && speechField === 'mobile' ? 'Đang ghi...' : 'Ghi âm'}
          </Button>
        </div>
      </div>

      {/* Lead Source */}
      <div className="mt-4">
        <Label htmlFor="leadSource" className="text-gray-700 dark:text-gray-200">
          Nguồn biết tin
        </Label>
        <Select onValueChange={setLeadSource} value={leadSource}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Chọn nguồn biết tin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friends">Bạn bè</SelectItem>
            <SelectItem value="ads">Quảng cáo</SelectItem>
            <SelectItem value="search">Tìm kiếm</SelectItem>
            <SelectItem value="other">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Type */}
      <div className="mt-4">
        <Label htmlFor="customerType" className="text-gray-700 dark:text-gray-200">
          Loại khách hàng
        </Label>
        <div className="flex items-center mt-1">
          <Input
            id="customerType"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            placeholder="Nhập loại khách hàng..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => startSpeechRecognition('customerType')}
            className="ml-2"
            variant={isRecording && speechField === 'customerType' ? 'destructive' : 'default'}
          >
            <Mic className="w-5 h-5" />
            {isRecording && speechField === 'customerType' ? 'Đang ghi...' : 'Ghi âm'}
          </Button>
        </div>
      </div>

      {/* Transaction Status */}
      <div className="mt-4">
        <Label htmlFor="transactionStatus" className="text-gray-700 dark:text-gray-200">
          Tình trạng giao dịch
        </Label>
        <div className="flex items-center mt-1">
          <Textarea
            id="transactionStatus"
            value={transactionStatus}
            onChange={(e) => setTransactionStatus(e.target.value)}
            placeholder="Nhập tình trạng giao dịch..."
            className="flex-1"
            rows={4}
          />
          <Button
            type="button"
            onClick={() => startSpeechRecognition('transactionStatus')}
            className="ml-2"
            variant={isRecording && speechField === 'transactionStatus' ? 'destructive' : 'default'}
          >
            <Mic className="w-5 h-5" />
            {isRecording && speechField === 'transactionStatus' ? 'Đang ghi...' : 'Ghi âm'}
          </Button>
        </div>
      </div>
    </div>
  );
}