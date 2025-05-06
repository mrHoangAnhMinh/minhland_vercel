'use client';

import { useState, useEffect } from 'react';
import ContactForm from '@/components/ContactForm';
import OptionalFields from '@/components/OptionalFields';
import Login from '@/components/Login';
import AdsTable from '@/components/AdsTable';
import { getAuth } from 'firebase/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState('');
  const [demand, setDemand] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [product, setProduct] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [note, setNote] = useState('');
  const [purpose, setPurpose] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [speechField, setSpeechField] = useState('demand');
  const [isRecording, setIsRecording] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        console.log('User logged in with email:', currentUser.email);
        fetchAds(currentUser.email);
      } else {
        console.log('No user logged in, clearing ads');
        setAds([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAds = async (userEmail: string) => {
    try {
      console.log('Fetching ads for email:', userEmail);
      const response = await fetch(`/api/sheets/get?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch ads failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch ads');
      }
      const data = await response.json();
      console.log('Ads data received:', data);
      if (Array.isArray(data)) {
        setAds(data);
      } else {
        console.error('Received data is not an array:', data);
        setAds([]);
      }
    } catch (err) {
      console.error('Fetch ads error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setAds([]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading image to:', `${process.env.NEXT_PUBLIC_API_URL}/upload-to-zalo`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-to-zalo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Upload image error response:', text);
        throw new Error('Failed to upload image: Server returned ' + response.status);
      }

      const data = await response.json();
      if (!data.data?.attachment_id) {
        console.error('Upload image error data:', data);
        throw new Error(data.error || 'Failed to upload image');
      }
      return data.data.attachment_id;
    } catch (err) {
      console.error('Upload image error:', err);
      throw err;
    }
  };

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
      const transcript = event.results[0][0].transcript;
      switch (field) {
        case 'name':
          setName((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'mobile':
          setMobile((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'source':
          setSource((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'type':
          setType((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'demand':
          setDemand((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'area':
          setArea((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'price':
          setPrice((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'product':
          setProduct((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'transactionStatus':
          setTransactionStatus((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'note':
          setNote((prev) => prev + (prev ? ' ' : '') + transcript);
          break;
      }
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      setError('Lỗi ghi âm: ' + event.error);
      setIsRecording(false);
    };
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demand || !area || !price || !product || !note) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc: Nhu cầu, Khu vực, Giá, Sản phẩm, Ghi chú');
      return;
    }
    if (!purpose) {
      setError('Vui lòng chọn mục đích');
      return;
    }
    if (!user) {
      setError('Vui lòng đăng nhập để gửi bài đăng');
      return;
    }

    try {
      let photoUrl = '';
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        try {
          photoUrl = await uploadImage(files[0]);
          console.log('Photo attachment_id received:', photoUrl);
        } catch (uploadErr) {
          console.warn('Image upload failed, proceeding without photo:', uploadErr);
          setError('Không thể upload ảnh, dữ liệu vẫn được gửi.');
        }
      }

      const adData = {
        demand,
        area,
        budget: price,
        product,
        note,
      };

      console.log('Generating ad content:', adData);

      const adResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-ad/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      if (!adResponse.ok) {
        const errorData = await adResponse.json();
        throw new Error(errorData.detail || 'Failed to generate ad');
      }

      const adResult = await adResponse.json();
      const adContent = adResult.ad_content;

      const adId = crypto.randomUUID();
      const sheetData = {
        name,
        mobile,
        source,
        type,
        demand,
        area,
        price,
        product,
        transactionStatus,
        note,
        email: user.email,
        platforms: platforms.join(', '),
        purpose,
        photo_url: photoUrl,
        ad_content: adContent,
        zalo_article_status: platforms.includes('Bài viết Zalo') ? 'Pending' : '',
        zalo_message_status: platforms.includes('Tin nhắn Zalo') ? 'Pending' : '',
        facebook_post_status: platforms.includes('Fanpage') ? 'Pending' : '',
        website_status: platforms.includes('Website') ? 'Pending' : '',
        ad_id: adId,
        error_message: '',
      };

      console.log('Saving to Google Sheets:', sheetData);

      const sheetResponse = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });

      if (!sheetResponse.ok) {
        const errorData = await sheetResponse.json();
        throw new Error(errorData.error || 'Failed to save to Google Sheets');
      }

      if (platforms.includes('Bài viết Zalo') && adContent) {
        try {
          const articleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/publish-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: adContent.split('.')[0],
              content: adContent,
              photo_url: photoUrl || 'https://tinhlong.com/images/1.jpg',
            }),
          });

          if (!articleResponse.ok) {
            const errorData = await articleResponse.json();
            throw new Error(errorData.detail || 'Failed to publish Zalo article');
          }

          const articleResult = await articleResponse.json();
          sheetData.zalo_article_status = articleResult.article_id;
        } catch (zaloErr) {
          console.warn('Zalo article post failed:', zaloErr);
          sheetData.error_message += `Zalo article error: ${zaloErr.message}; `;
        }
      }

      if (platforms.includes('Tin nhắn Zalo') && adContent) {
        try {
          const messageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: adContent }),
          });

          if (!messageResponse.ok) {
            const errorData = await messageResponse.json();
            throw new Error(errorData.detail || 'Failed to send Zalo message');
          }

          const messageResult = await messageResponse.json();
          sheetData.zalo_message_status = messageResult.message_id;
        } catch (messageErr) {
          console.warn('Zalo message failed:', messageErr);
          sheetData.error_message += `Zalo message error: ${messageErr.message}; `;
        }
      }

      if (platforms.includes('Fanpage') && adContent) {
        try {
          const fbResponse = await fetch('https://graph.facebook.com/v17.0/me/feed', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: adContent,
              link: photoUrl || 'https://minhland.com',
            }),
          });

          if (!fbResponse.ok) {
            const errorData = await fbResponse.json();
            throw new Error(errorData.error?.message || 'Failed to post to Facebook');
          }

          const fbResult = await fbResponse.json();
          sheetData.facebook_post_status = fbResult.id;
        } catch (fbErr) {
          console.warn('Facebook post failed:', fbErr);
          sheetData.error_message += `Facebook error: ${fbErr.message}; `;
        }
      }

      if (platforms.includes('Website') && adContent) {
        try {
          const docRef = await addDoc(collection(db, 'ads'), {
            adId,
            ad_content: adContent,
            photo_url: photoUrl,
            rowIndex: ads.length + 1,
            name,
            mobile,
            source,
            type,
            demand,
            area,
            price,
            product,
            transactionStatus,
            note,
            email: user.email,
            platforms: platforms.join(', '),
            purpose,
            createdAt: new Date().toISOString(),
          });
          sheetData.website_status = adId;
        } catch (firestoreErr) {
          console.warn('Firestore save failed:', firestoreErr);
          sheetData.error_message += `Firestore error: ${firestoreErr.message}; `;
        }
      }

      const newAd = { ...sheetData };
      setAds((prev) => [newAd, ...prev]);

      alert('Form đã được gửi thành công!');
      setName('');
      setMobile('');
      setSource('');
      setType('');
      setDemand('');
      setArea('');
      setPrice('');
      setProduct('');
      setTransactionStatus('');
      setNote('');
      setPurpose('');
      setPlatforms([]);
      setFiles([]);
      setImagePreview(null);
      setVideoPreview(null);
      setError('');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <header className="bg-blue-600 text-amber-300 py-4 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Minhland - Bất Động Sản</h1>
          <p>Nền tảng quản lý và quảng cáo bất động sản</p>
        </div>
      </header>
      <section className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 column-container">
          <div className="column">
            <ContactForm
              demand={demand}
              setDemand={setDemand}
              area={area}
              setArea={setArea}
              price={price}
              setPrice={setPrice}
              product={product}
              setProduct={setProduct}
              note={note}
              setNote={setNote}
              purpose={purpose}
              setPurpose={setPurpose}
              platforms={platforms}
              setPlatforms={setPlatforms}
              error={error}
              setError={setError}
              speechField={speechField}
              setSpeechField={setSpeechField}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              startSpeechRecognition={startSpeechRecognition}
              name={name}
              mobile={mobile}
              source={source}
              type={type}
              transactionStatus={transactionStatus}
            />
          </div>
          <div className="column">
            <OptionalFields
              name={name}
              setName={setName}
              mobile={mobile}
              setMobile={setMobile}
              source={source}
              setSource={setSource}
              type={type}
              setType={setType}
              transactionStatus={transactionStatus}
              setTransactionStatus={setTransactionStatus}
              files={files}
              setFiles={setFiles}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              videoPreview={videoPreview}
              setVideoPreview={setVideoPreview}
              speechField={speechField}
              setSpeechField={setSpeechField}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              setError={setError}
              startSpeechRecognition={startSpeechRecognition}
              handleSubmit={handleSubmit}
              error={error}
              platforms={platforms}
              purpose={purpose}
            />
          </div>
          <div className="column">
            <Login setUser={setUser} />
            {user && user.email === 'tinhlongjsc@gmail.com' && (
              <Link href="/admin/users">
                <Button className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white">
                  Quản lý người dùng
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6 text-green-700">
            Danh sách bài đăng
          </h3>
          <AdsTable ads={ads} setAds={setAds} user={user} />
        </div>
      </section>
      <footer className="bg-blue-600 text-amber-300 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>Minhland JSC</p>
          <p>Email: contact@minhland.com | Website: https://minhland.com</p>
        </div>
      </footer>
    </main>
  );
}