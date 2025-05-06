import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fetch from 'node-fetch';
import { google } from 'googleapis';

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

export async function POST(request: Request) {
  const {
    name, mobile, address, content, platforms, photo, rowIndex, adId, zaloid, subpage, email, purpose
  } = await request.json();

  const results: any = {};
  const MAX_CELL_LENGTH = 50000; // Google Sheets cell limit

  try {
    // Zalo Article
    if (platforms.includes('Zalo Article')) {
      const zaloResponse = await fetch('https://openapi.zalo.me/v2.0/oa/article/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: process.env.ZALO_ACCESS_TOKEN || '',
        },
        body: JSON.stringify({
          title: `${name} - ${address}`,
          cover_type: photo ? 'photo' : 'text',
          cover_photo: photo ? { photo_id: photo } : undefined,
          cover_status: 'show',
          body: [
            {
              type: 'text',
              content: `${content}\nLiên hệ: ${mobile}`,
            },
          ],
          status: 'show',
        }),
      });
      if (!zaloResponse.ok) {
        const errorText = await zaloResponse.text();
        console.error(`Zalo Article error: ${zaloResponse.status} - ${errorText}`);
        throw new Error(`Zalo Article failed: ${errorText}`);
      }
      results.zaloArticle = await zaloResponse.json();
      // Save full response to Firestore
      await setDoc(doc(db, 'api_responses', `${adId}_zaloArticle`), {
        adId,
        platform: 'Zalo Article',
        response: results.zaloArticle,
        timestamp: new Date().toISOString(),
      });
    }

    // Zalo Message
    if (platforms.includes('Zalo Message') && zaloid) {
      const zaloMsgResponse = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: process.env.ZALO_ACCESS_TOKEN || '',
        },
        body: JSON.stringify({
          recipient: { user_id: zaloid },
          message: {
            text: `${content}\nLiên hệ: ${mobile}`,
          },
        }),
      });
      if (!zaloMsgResponse.ok) {
        const errorText = await zaloMsgResponse.text();
        console.error(`Zalo Message error: ${zaloMsgResponse.status} - ${errorText}`);
        throw new Error(`Zalo Message failed: ${errorText}`);
      }
      results.zaloMessage = await zaloMsgResponse.json();
      // Save full response to Firestore
      await setDoc(doc(db, 'api_responses', `${adId}_zaloMessage`), {
        adId,
        platform: 'Zalo Message',
        response: results.zaloMessage,
        timestamp: new Date().toISOString(),
      });
    }

    // Facebook
    if (platforms.includes('Facebook')) {
      const fbResponse = await fetch(
        `https://graph.facebook.com/v14.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            message: `${content}\nLiên hệ: ${mobile}\nĐịa chỉ: ${address}`,
          }),
        }
      );
      if (!fbResponse.ok) {
        const errorText = await fbResponse.text();
        console.error(`Facebook error: ${fbResponse.status} - ${errorText}`);
        throw new Error(`Facebook failed: ${errorText}`);
      }
      results.facebook = await fbResponse.json();
      // Save full response to Firestore
      await setDoc(doc(db, 'api_responses', `${adId}_facebook`), {
        adId,
        platform: 'Facebook',
        response: results.facebook,
        timestamp: new Date().toISOString(),
      });
    }

    // Website (Firestore)
    if (platforms.includes('Website') && subpage) {
      const websiteData = {
        adId,
        name,
        mobile,
        address,
        content,
        photo,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'ads', adId), websiteData);
      results.website = { success: true, adId };
      // Save full response to Firestore
      await setDoc(doc(db, 'api_responses', `${adId}_website`), {
        adId,
        platform: 'Website',
        response: results.website,
        timestamp: new Date().toISOString(),
      });
    }

    // Update Google Sheets with summarized results
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const truncate = (str: string, max: number) => str.length > max ? str.slice(0, max - 3) + '...' : str;

    // Map values according to COLS
    const updateValues = [
      [
        name, // A: NAME (1)
        mobile, // B: PHONE (2)
        '', // C: SOURCE (3)
        '', // D: TYPE (4)
        '', // E: DEMAND (5)
        '', // F: AREA (6)
        '', // G: BUDGET (7)
        '', // H: PRODUCT (8)
        '', // I: STATUS (9)
        '', // J: NOTE (10)
        '', // K: NOTE_HISTORY (11)
        '', // L: FIRST_CONTACT (12)
        '', // M: LAST_CONTACT (13)
        '', // N: DRIVE_LINK (14)
        '', // O: FOLDER_CREATED (15)
        '', // P: FOLDER_ID (16)
        '', // Q: DOC_CREATED (17)
        adId, // R: ID (18)
        truncate(content, 1000), // S: AD_CONTENT (19)
        results.zaloArticle ? truncate(`Article ID: ${results.zaloArticle.data?.article_id || 'N/A'}`, 100) : '', // T: ZALO_STATUS (20)
        results.zaloMessage ? truncate(`Message ID: ${results.zaloMessage.data?.msg_id || 'N/A'}`, 100) : '', // U: ZALO_MSG_STATUS (21)
        truncate(photo || '', 500), // V: PHOTO_URL (22)
        results.facebook ? truncate(`Post ID: ${results.facebook.id || 'N/A'}`, 100) : '', // W: FACEBOOK_STATUS (23)
        results.website ? truncate(`Ad ID: ${results.website.adId}`, 100) : '', // X: WEBSITE_STATUS (24)
        '', // Y: (25)
        '', // Z: (26)
        email || '', // AA: email (27)
        platforms.join(','), // AB: platforms (28)
        purpose || '', // AC: purpose (29)
        '', // AD: emailERROR_MESSAGE (30)
      ],
    ];

    // Check for cell length
    updateValues[0].forEach((cell, index) => {
      if (typeof cell === 'string' && cell.length > MAX_CELL_LENGTH) {
        console.warn(`Cell at column ${String.fromCharCode(65 + index)} exceeds ${MAX_CELL_LENGTH} characters: ${cell.length}`);
        updateValues[0][index] = truncate(cell, MAX_CELL_LENGTH);
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: `DS khách hàng Tinh Long!A${rowIndex}:AD${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: updateValues },
    });

    return Response.json({ message: 'Published successfully', results });
  } catch (error: any) {
    console.error('Error publishing:', error);
    return Response.json({ message: 'Error publishing', error: error.message }, { status: 500 });
  }
}