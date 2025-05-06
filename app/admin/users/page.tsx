'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<{ displayName: string; email: string; phoneNumber: string }>({
    displayName: '',
    email: '',
    phoneNumber: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = auth.currentUser;
        console.log('Current user:', user);
        if (!user) {
          console.log('No user logged in, redirecting to home');
          router.push('/');
          return;
        }
        if (user.email !== 'tinhlongjsc@gmail.com') {
          console.log('User is not admin, access denied:', user.email);
          setError('Bạn không có quyền truy cập trang này.');
          setLoading(false);
          return;
        }

        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        console.log('Firestore snapshot:', userSnapshot);
        const userList = userSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('User data:', data);
          return data as User;
        });
        setUsers(userList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError('Lỗi khi tải danh sách người dùng: ' + err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  useEffect(() => {
    console.log('Add button state:', isAddModalOpen);
  }, [isAddModalOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Lỗi đăng xuất: ' + err.message);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (uid: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        setUsers(users.filter(user => user.uid !== uid));
        console.log('User deleted successfully:', uid);
      } catch (err: any) {
        console.error('Error deleting user:', err);
        setError('Lỗi khi xóa user: ' + err.message);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      try {
        await updateDoc(doc(db, 'users', selectedUser.uid), {
          displayName: selectedUser.displayName,
          email: selectedUser.email,
          phoneNumber: selectedUser.phoneNumber,
        });
        setUsers(users.map(user => (user.uid === selectedUser.uid ? selectedUser : user)));
        setIsEditModalOpen(false);
        console.log('User updated successfully:', selectedUser.uid);
      } catch (err: any) {
        console.error('Error updating user:', err);
        setError('Lỗi khi cập nhật user: ' + err.message);
      }
    }
  };

  const handleAdd = async () => {
    try {
      const newUid = Date.now().toString();
      await setDoc(doc(db, 'users', newUid), {
        uid: newUid,
        displayName: newUser.displayName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        createdAt: new Date().toISOString(),
      });
      setUsers([...users, { uid: newUid, ...newUser, createdAt: new Date().toISOString() }]);
      setNewUser({ displayName: '', email: '', phoneNumber: '' });
      setIsAddModalOpen(false);
      console.log('User added successfully:', newUid);
    } catch (err: any) {
      console.error('Error adding user:', err);
      setError('Lỗi khi thêm user: ' + err.message);
    }
  };

  if (loading) {
    return <p className="text-gray-700 dark:text-gray-200 p-4">Đang tải...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Quản lý người dùng</h1>
      <Button onClick={handleSignOut} className="mb-4 bg-green-700 hover:bg-green-800 text-white">
        Đăng xuất
      </Button>
      <div className="mb-4">
        <Button
          onClick={() => {
            console.log('Add button clicked');
            setIsAddModalOpen(true);
          }}
          className="bg-green-700 hover:bg-green-800 text-white"
          disabled={false}
        >
          Thêm người dùng
        </Button>
      </div>
      {users.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-200">Chưa có người dùng nào.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 w-[50px] text-center">STT</th>
              <th className="border border-gray-300 p-2 w-[250px]">Họ và tên</th>
              <th className="border border-gray-300 p-2 text-center">Email</th>
              <th className="border border-gray-300 p-2 w-[120px] text-center">Số điện thoại</th>
              <th className="border border-gray-300 p-2 w-[200px] text-center">Ngày đăng ký</th>
              <th className="border border-gray-300 p-2 w-[120px]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.uid}>
                <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 p-2">{user.displayName}</td>
                <td className="border border-gray-300 p-2 text-center">{user.email}</td>
                <td className="border border-gray-300 p-2 text-center">{user.phoneNumber}</td>
                <td className="border border-gray-300 p-2 text-center">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="border border-gray-300 p-2 flex justify-center items-center gap-2">
                  <Button onClick={() => handleEdit(user)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(user.uid)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal chỉnh sửa */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-displayName">Tên</Label>
                <Input
                  id="edit-displayName"
                  value={selectedUser.displayName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phoneNumber">Số điện thoại</Label>
                <Input
                  id="edit-phoneNumber"
                  value={selectedUser.phoneNumber}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsEditModalOpen(false)} className="mr-2 bg-gray-500 hover:bg-gray-600 text-white">
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} className="bg-green-700 hover:bg-green-800 text-white">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal thêm user */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-displayName">Tên</Label>
              <Input
                id="add-displayName"
                value={newUser.displayName}
                onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="add-phoneNumber">Số điện thoại</Label>
              <Input
                id="add-phoneNumber"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddModalOpen(false)} className="mr-2 bg-gray-500 hover:bg-gray-600 text-white">
              Hủy
            </Button>
            <Button onClick={handleAdd} className="bg-green-700 hover:bg-green-800 text-white">
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}