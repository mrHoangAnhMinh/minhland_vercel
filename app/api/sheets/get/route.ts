import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      console.error('Missing email parameter in GET request');
      return NextResponse.json([], { status: 400 });
    }

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
      console.error('Missing Google Sheets environment variables:', {
        GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
        GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
        GOOGLE_SPREADSHEET_ID: !!process.env.GOOGLE_SPREADSHEET_ID,
      });
      return NextResponse.json([], { status: 500 });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('Invalid GOOGLE_PRIVATE_KEY format');
      return NextResponse.json([], { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'DS khách hàng Tinh Long!A2:AC',
    });

    const rows = response.data.values || [];
    console.log('Raw rows from sheet:', rows);
    const ads = rows
      .map((row, index) => ({
        rowIndex: index + 2, // Add rowIndex for reference
        name: row[1] || '', //A
        mobile: row[2] || '', //B
        source: row[3] || '', //C
        type: row[4] || '', //D
        demand: row[5] || '', //E
        area: row[6] || '', //F
        price: row[7] || '', //G
        product: row[8] || '', //H
        transactionStatus: row[9] || '', //I
        note: row[10] || '', //J
        ad_content: row[19] || '', // Cột S
        zalo_article_status: row[20] || '', // Cột T
        zalo_message_status: row[21] || '', // Cột U
        photo_url: row[22] || '', // Cột V
        facebook_post_status: row[23] || '', // Cột W
        website_status: row[24] || '', // Cột X
        email: row[27] || '', // Cột AA
        platforms: row[28] || '', // Cột AB
        purpose: row[29] || '', // Cột AC
      }))
      .filter(row => row.email === email);

    console.log('Filtered ads for email', email, ':', ads);
    return NextResponse.json(ads.length > 0 ? ads : []);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return NextResponse.json([], { status: 500 });
  }
}