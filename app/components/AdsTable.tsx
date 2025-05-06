'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Ad {
  rowIndex: number;
  name: string;
  mobile: string;
  source: string;
  type: string;
  demand: string;
  area: string;
  price: string;
  product: string;
  transactionStatus: string;
  note: string;
  email: string;
  platforms: string;
  purpose: string;
  photo_url: string;
  zalo_article_status: string;
  zalo_message_status: string;
  facebook_post_status: string;
  website_status: string;
}

interface AdsTableProps {
  ads: Ad[];
  setAds: (ads: Ad[]) => void;
  user: any;
}

export default function AdsTable({ ads, setAds, user }: AdsTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Ad | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const platformOptions = ['Bài viết Zalo', 'Tin nhắn Zalo', 'Fanpage', 'Website'];

  const handleEdit = (index: number, ad: Ad) => {
    if (!user || (!user.email && user.email !== 'tinhlongjsc@gmail.com' && user.email !== ad.email)) return;
    setEditingIndex(index);
    setEditData({ ...ad });
    // Tách chuỗi platforms thành mảng
    setSelectedPlatforms(ad.platforms ? ad.platforms.split(',') : []);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
    setSelectedPlatforms([]);
    setIsDialogOpen(false);
  };

  const handlePlatformChange = (value: string) => {
    let newPlatforms: string[];
    if (selectedPlatforms.includes(value)) {
      // Xóa lựa chọn nếu đã chọn
      newPlatforms = selectedPlatforms.filter((platform) => platform !== value);
    } else {
      // Thêm lựa chọn mới
      newPlatforms = [...selectedPlatforms, value];
    }
    setSelectedPlatforms(newPlatforms);
    // Cập nhật editData.platforms thành chuỗi
    setEditData((prev) => (prev ? { ...prev, platforms: newPlatforms.join(',') } : prev));
  };

  const handleSaveEdit = async (index: number) => {
    if (!editData || !user || (!user.email && user.email !== 'tinhlongjsc@gmail.com' && user.email !== ads[index].email)) return;

    try {
      const response = await fetch('/api/sheets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: ads[index].rowIndex,
          data: {
            name: editData.name,
            mobile: editData.mobile,
            source: editData.source,
            type: editData.type,
            demand: editData.demand,
            area: editData.area,
            price: editData.price,
            product: editData.product,
            transactionStatus: editData.transactionStatus,
            note: editData.note,
            platforms: editData.platforms,
            purpose: editData.purpose,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update ad');
      }

      const updatedAds = [...ads];
      updatedAds[index] = { ...editData };
      setAds(updatedAds);

      setEditingIndex(null);
      setEditData(null);
      setSelectedPlatforms([]);
      setIsDialogOpen(false);
      alert('Cập nhật bài đăng thành công!');
    } catch (err) {
      console.error('Update error:', err);
      alert('Lỗi khi cập nhật bài đăng: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    }
  };

  const handleDelete = async (index: number) => {
    if (!user || (!user.email && user.email !== 'tinhlongjsc@gmail.com' && user.email !== ads[index].email)) return;
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;

    try {
      const response = await fetch('/api/sheets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: ads[index].rowIndex,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete ad');
      }

      const updatedAds = ads
        .filter((_, i) => i !== index)
        .map((ad, i) => ({
          ...ad,
          rowIndex: i + 2, // Reassign rowIndex starting from A2
        }));
      setAds(updatedAds);
      alert('Xóa bài đăng thành công!');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Lỗi khi xóa bài đăng: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    }
  };

  // Đảm bảo ads là mảng trước khi map
  const safeAds = Array.isArray(ads) ? ads : [];

  // Hàm kiểm tra URL hợp lệ
  const isValidUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border border-gray-400">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="border border-gray-400">STT</TableHead>
            <TableHead className="border border-gray-400">Tên khách hàng</TableHead>
            <TableHead className="border border-gray-400">Số điện thoại</TableHead>
            <TableHead className="border border-gray-400">Nguồn biết tin</TableHead>
            <TableHead className="border border-gray-400">Loại khách hàng</TableHead>
            <TableHead className="border border-gray-400">Nhu cầu</TableHead>
            <TableHead className="border border-gray-400">Khu vực</TableHead>
            <TableHead className="border border-gray-400">Giá</TableHead>
            <TableHead className="border border-gray-400">Sản phẩm</TableHead>
            <TableHead className="border border-gray-400">Tình trạng giao dịch</TableHead>
            <TableHead className="border border-gray-400">Ghi chú</TableHead>
            <TableHead className="border border-gray-400">Nơi muốn đăng</TableHead>
            <TableHead className="border border-gray-400">Mục đích</TableHead>
            <TableHead className="border border-gray-400">Ảnh bìa</TableHead>
            <TableHead className="border border-gray-400">Trạng thái bài viết Zalo</TableHead>
            <TableHead className="border border-gray-400">Trạng thái tin nhắn Zalo</TableHead>
            <TableHead className="border border-gray-400">Trạng thái Fanpage</TableHead>
            <TableHead className="border border-gray-400">Trạng thái Website</TableHead>
            <TableHead className="border border-gray-400">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeAds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={18} className="text-center border border-gray-400">
                Chưa có bài đăng nào.
              </TableCell>
            </TableRow>
          ) : (
            safeAds.map((ad, index) => (
              <TableRow key={index}>
                <TableCell className="border border-gray-400">{index + 1}</TableCell>
                <TableCell className="border border-gray-400">{ad.name}</TableCell>
                <TableCell className="border border-gray-400">{ad.mobile}</TableCell>
                <TableCell className="border border-gray-400">{ad.source}</TableCell>
                <TableCell className="border border-gray-400">{ad.type}</TableCell>
                <TableCell className="border border-gray-400">{ad.demand}</TableCell>
                <TableCell className="border border-gray-400">{ad.area}</TableCell>
                <TableCell className="border border-gray-400">{ad.price}</TableCell>
                <TableCell className="border border-gray-400">{ad.product}</TableCell>
                <TableCell className="border border-gray-400">{ad.transactionStatus}</TableCell>
                <TableCell className="border border-gray-400">{ad.note}</TableCell>
                <TableCell className="border border-gray-400">{ad.platforms}</TableCell>
                <TableCell className="border border-gray-400">{ad.purpose}</TableCell>
                <TableCell className="border border-gray-400">
                  {ad.photo_url && isValidUrl(ad.photo_url) ? (
                    <a href={ad.photo_url} target="_blank" rel="noopener noreferrer">
                      <img src={ad.photo_url} alt="Thumbnail" style={{ width: '50px', height: '50px' }} />
                    </a>
                  ) : (
                    '📷'
                  )}
                </TableCell>
                <TableCell className="border border-gray-400">{ad.zalo_article_status || 'N/A'}</TableCell>
                <TableCell className="border border-gray-400">{ad.zalo_message_status || 'N/A'}</TableCell>
                <TableCell className="border border-gray-400">{ad.facebook_post_status || 'N/A'}</TableCell>
                <TableCell className="border border-gray-400">{ad.website_status || 'N/A'}</TableCell>
                <TableCell className="h-[60px] flex justify-center items-center gap-2">
                  {user && (user.email === 'tinhlongjsc@gmail.com' || user.email === ad.email) ? (
                    <>
                      <Button
                        asChild
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          Xem
                        </a>
                      </Button>
                      <Button
                        onClick={() => handleEdit(index, ad)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Sửa
                      </Button>
                      <Button
                        onClick={() => handleDelete(index)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
                      >
                        Xóa
                      </Button>
                    </>
                  ) : (
                    <span>Không có quyền</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editData && editingIndex !== null && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Chỉnh sửa bài đăng</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium text-gray-700">Tên khách hàng</label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="mobile" className="text-right text-sm font-medium text-gray-700">Số điện thoại</label>
                <Input
                  id="mobile"
                  value={editData.mobile}
                  onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="source" className="text-right text-sm font-medium text-gray-700">Nguồn biết tin</label>
                <Input
                  id="source"
                  value={editData.source}
                  onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="type" className="text-right text-sm font-medium text-gray-700">Loại khách hàng</label>
                <Input
                  id="type"
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="demand" className="text-right text-sm font-medium text-gray-700">Nhu cầu</label>
                <Input
                  id="demand"
                  value={editData.demand}
                  onChange={(e) => setEditData({ ...editData, demand: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="area" className="text-right text-sm font-medium text-gray-700">Khu vực</label>
                <Input
                  id="area"
                  value={editData.area}
                  onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="price" className="text-right text-sm font-medium text-gray-700">Giá</label>
                <Input
                  id="price"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="product" className="text-right text-sm font-medium text-gray-700">Sản phẩm</label>
                <Input
                  id="product"
                  value={editData.product}
                  onChange={(e) => setEditData({ ...editData, product: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="transactionStatus" className="text-right text-sm font-medium text-gray-700">Tình trạng giao dịch</label>
                <Input
                  id="transactionStatus"
                  value={editData.transactionStatus}
                  onChange={(e) => setEditData({ ...editData, transactionStatus: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note" className="text-right text-sm font-medium text-gray-700">Ghi chú</label>
                <Input
                  id="note"
                  value={editData.note}
                  onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                  className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="platforms" className="text-right text-sm font-medium text-gray-700">Nơi muốn đăng</label>
                <Select
                  value={''} // Không cần value trực tiếp vì dùng multi-select
                  onValueChange={handlePlatformChange}
                >
                  <SelectTrigger
                    id="platforms"
                    className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <SelectValue placeholder="Chọn nơi đăng">
                      {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'Chọn nơi đăng'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform)}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="purpose" className="text-right text-sm font-medium text-gray-700">Mục đích</label>
                <Select
                  value={editData.purpose}
                  onValueChange={(value) => setEditData({ ...editData, purpose: value })}
                >
                  <SelectTrigger
                    id="purpose"
                    className="col-span-3 w-full h-10 text-base bg-white border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <SelectValue placeholder="Chọn mục đích" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bất động sản">Bất động sản</SelectItem>
                    <SelectItem value="Quảng bá">Quảng bá</SelectItem>
                    <SelectItem value="CSKH">CSKH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Hủy
              </Button>
              <Button
                onClick={() => handleSaveEdit(editingIndex!)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}