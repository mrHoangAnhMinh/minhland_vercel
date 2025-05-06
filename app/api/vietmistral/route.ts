import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, source, type, demand, area, price, product, transactionStatus, note } = body;

    // Chuẩn bị prompt cho Viet-Mistral 7B
    const prompt = `
Tạo một bài quảng cáo bất động sản ngắn gọn, hấp dẫn dựa trên thông tin sau:
- Tên khách hàng: ${name || 'Không có'}
- Số điện thoại: ${mobile || 'Không có'}
- Nguồn biết tin: ${source || 'Không có'}
- Loại khách hàng: ${type || 'Không có'}
- Nhu cầu: ${demand || 'Không có'}
- Khu vực: ${area || 'Không có'}
- Giá: ${price || 'Không có'}
- Sản phẩm: ${product || 'Không có'}
- Tình trạng giao dịch: ${transactionStatus || 'Không có'}
- Ghi chú: ${note || 'Không có'}

Yêu cầu:
- Ngắn gọn, tối đa 150 từ.
- Ngôn ngữ tự nhiên, thu hút, đúng ngữ pháp tiếng Việt.
- Tập trung vào sản phẩm, khu vực, giá, và nhu cầu.
- Thêm lời kêu gọi hành động (VD: "Liên hệ ngay!").
`;

    // Gọi Viet-Mistral 7B (giả định chạy local)
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_length: 200 }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate ad content');
    }

    const data = await response.json();
    const adContent = data.text || 'Không thể tạo quảng cáo.';

    return NextResponse.json({ ad_content: adContent });
  } catch (error) {
    console.error('Error generating ad content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}