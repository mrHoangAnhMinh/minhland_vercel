import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad_content, photo_url, platforms } = body;

    const statuses: {
      zalo_article_status: string;
      zalo_message_status: string;
      facebook_post_status: string;
      website_status: string;
    } = {
      zalo_article_status: '',
      zalo_message_status: '',
      facebook_post_status: '',
      website_status: '',
    };

    // Mock API calls cho các nền tảng
    for (const platform of platforms) {
      let response;
      switch (platform) {
        case 'Bài viết Zalo':
          // Thay bằng API Zalo thật nếu có
          response = await mockApiCall('Zalo Article', ad_content, photo_url);
          statuses.zalo_article_status = response.status;
          break;
        case 'Tin nhắn Zalo':
          response = await mockApiCall('Zalo Message', ad_content, photo_url);
          statuses.zalo_message_status = response.status;
          break;
        case 'Fanpage':
          // Thay bằng API Facebook thật nếu có
          response = await mockApiCall('Facebook', ad_content, photo_url);
          statuses.facebook_post_status = response.status;
          break;
        case 'Website':
          // Giả định website là minhland.com
          response = await mockApiCall('Website', ad_content, photo_url);
          statuses.website_status = response.status;
          break;
      }
    }

    return NextResponse.json({ message: 'Platforms processed', statuses });
  } catch (error) {
    console.error('Error processing platforms:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Hàm mock API call
async function mockApiCall(platform: string, ad_content: string, photo_url: string) {
  // Giả lập thời gian xử lý
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Mock API call to ${platform} with content: ${ad_content}, photo: ${photo_url}`);
  return { status: 'Posted' };
}