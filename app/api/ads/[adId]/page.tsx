import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface AdPageProps {
  params: { adId: string };
}

export default async function AdPage({ params }: AdPageProps) {
  const { adId } = params;

  // Lấy dữ liệu quảng cáo từ API
  const response = await fetch(`http://localhost:3000/api/ads?adId=${adId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    notFound();
  }

  const ad = await response.json();

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <header className="bg-blue-600 text-amber-300 py-4 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Quảng cáo Bất Động Sản - Minhland</h1>
        </div>
      </header>
      <section className="container mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Chi tiết quảng cáo</h2>
          {ad.photo_url && (
            <img
              src={ad.photo_url}
              alt="Ảnh quảng cáo"
              className="w-full max-w-md mx-auto mb-4 rounded-md"
            />
          )}
          <div className="prose dark:prose-invert">
            <p className="text-gray-900 dark:text-gray-100">{ad.ad_content}</p>
          </div>
          <Link href="/">
            <Button className="mt-4 bg-green-700 hover:bg-green-800 text-white">
              Quay lại
            </Button>
          </Link>
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