'use client';

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
import { Mic } from 'lucide-react';

interface ContactFormProps {
  demand: string;
  setDemand: (value: string) => void;
  area: string;
  setArea: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  product: string;
  setProduct: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  platforms: string[];
  setPlatforms: (value: string[]) => void;
  error: string;
  setError: (value: string) => void;
  speechField?: string;
  setSpeechField: (value: string) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  startSpeechRecognition: (field: string) => void;
  name: string;
  mobile: string;
  source: string;
  type: string;
  transactionStatus: string;
}

export default function ContactForm({
  demand,
  setDemand,
  area,
  setArea,
  price,
  setPrice,
  product,
  setProduct,
  note,
  setNote,
  purpose,
  setPurpose,
  platforms,
  setPlatforms,
  error,
  setError,
  speechField = 'demand',
  setSpeechField,
  isRecording,
  setIsRecording,
  startSpeechRecognition,
  name,
  mobile,
  source,
  type,
  transactionStatus,
}: ContactFormProps) {
  const platformOptions = ['Bài viết Zalo', 'Tin nhắn Zalo', 'Fanpage', 'Website'];

  const handlePlatformChange = (value: string) => {
    let newPlatforms: string[];
    if (platforms.includes(value)) {
      // Xóa lựa chọn nếu đã chọn
      newPlatforms = platforms.filter((platform) => platform !== value);
    } else {
      // Thêm lựa chọn mới
      newPlatforms = [...platforms, value];
    }
    setPlatforms(newPlatforms);
  };

  return (
    <div className="column">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Thông tin sản phẩm</h2>
      <div className="space-y-6">
        {/* Platforms */}
        <div>
          <Label htmlFor="platforms" className="text-gray-700 dark:text-gray-200 font-bold">
            Nơi muốn đăng
          </Label>
          <Select
            value={''} // Không cần value trực tiếp vì dùng multi-select
            onValueChange={handlePlatformChange}
          >
            <SelectTrigger
              id="platforms"
              className="mt-1 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <SelectValue placeholder="Chọn nơi đăng">
                {platforms.length > 0 ? platforms.join(', ') : 'Chọn nơi đăng'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {platformOptions.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => handlePlatformChange(platform)}
                      className="mr-2"
                    />
                    {platform}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purpose */}
        <div>
          <Label htmlFor="purpose" className="text-gray-700 dark:text-gray-200 font-bold">
            Mục đích *
          </Label>
          <Select onValueChange={setPurpose} value={purpose}>
            <SelectTrigger className="mt-1 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Chọn mục đích..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bất động sản">Bất động sản</SelectItem>
              <SelectItem value="Quảng bá">Quảng bá</SelectItem>
              <SelectItem value="CSKH">CSKH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Demand */}
        <div>
          <Label htmlFor="demand" className="text-gray-700 dark:text-gray-200 font-bold">
            Nhu cầu *
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="demand"
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              placeholder="Nhập nhu cầu..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('demand')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'demand' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'demand' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Area */}
        <div>
          <Label htmlFor="area" className="text-gray-700 dark:text-gray-200 font-bold">
            Khu vực *
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Nhập khu vực..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('area')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'area' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'area' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price" className="text-gray-700 dark:text-gray-200 font-bold">
            Giá *
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('price')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'price' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'price' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Product */}
        <div>
          <Label htmlFor="product" className="text-gray-700 dark:text-gray-200 font-bold">
            Sản phẩm *
          </Label>
          <div className="flex items-center mt-1">
            <Input
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Nhập sản phẩm..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('product')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'product' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'product' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Note */}
        <div>
          <Label htmlFor="note" className="text-gray-700 dark:text-gray-200 font-bold">
            Ghi chú *
          </Label>
          <div className="flex items-center mt-1">
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="flex-1"
              rows={4}
            />
            <Button
              type="button"
              onClick={() => startSpeechRecognition('note')}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              variant={isRecording && speechField === 'note' ? 'destructive' : 'default'}
            >
              <Mic className="w-5 h-5" />
              {isRecording && speechField === 'note' ? 'Đang ghi...' : 'Ghi âm'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}