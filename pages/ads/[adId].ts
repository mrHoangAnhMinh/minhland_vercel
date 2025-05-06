import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Ad {
  adId: string;
  rowIndex: number;
  adContent: string;
  photoUrl: string;
  demand: string;
  product: string;
  area: string;
  name: string;
  phone: string;
  budget: string;
  note: string;
  purpose: string;
  createdAt: string;
}

export default function AdDetail() {
  const router = useRouter();
  const { adId } = router.query;
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adId && typeof adId === 'string') {
      const fetchAd = async () => {
        try {
          const docRef = doc(db, 'ads', adId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAd(docSnap.data() as Ad);
          } else {
            console.error('Ad not found');
          }
        } catch (error) {
          console.error('Error fetching ad:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAd();
    }
  }, [adId]);

  if (loading) return <div>Đang tải...</div>;
  if (!ad) return <div>Quảng cáo không tồn tại</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{ad.demand} {ad.product} tại {ad.area}</h1>
      {ad.photoUrl && <img src={ad.photoUrl} alt="Ad" className="w-full max-w-md my-4" />}
      <p>{ad.adContent}</p>
      <p><strong>Họ tên:</strong> {ad.name}</p>
      <p><strong>Số điện thoại:</strong> {ad.phone}</p>
      <p><strong>Ngân sách:</strong> {ad.budget}</p>
      <p><strong>Ghi chú:</strong> {ad.note}</p>
      <p><strong>Mục đích:</strong> {ad.purpose}</p>
    </div>
  );
}