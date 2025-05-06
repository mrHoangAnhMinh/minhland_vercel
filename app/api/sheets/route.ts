import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data for Google Sheets:', body);

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
      console.error('Missing Google Sheets environment variables');
      return NextResponse.json({ error: 'Missing Google Sheets environment variables' }, { status: 500 });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('Invalid GOOGLE_PRIVATE_KEY format');
      return NextResponse.json({ error: 'Invalid GOOGLE_PRIVATE_KEY format' }, { status: 500 });
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

    const row = [
      body.name || '',
      body.mobile || '',
      body.source || '',
      body.type || '',
      body.demand || '',
      body.area || '',
      body.price || '',
      body.product || '',
      body.transactionStatus || '',
      body.note || '',
      '', // Placeholder for date fields
      '', // Placeholder for date fields
      '', // Placeholder for date fields
      body.photo_url || '',
      '', // Placeholder for status fields
      '', // Placeholder for status fields
      '', // Placeholder for status fields
      '', // Placeholder for status fields
      body.zalo_article_status || '',
      body.zalo_message_status || '',
      body.facebook_post_status || '',
      body.website_status || '',
      '', // Placeholder for additional fields
      '', // Placeholder for additional fields
      '', // Placeholder for additional fields
      '', // Placeholder for additional fields
      body.email || '',
      body.platforms || '',
      body.purpose || '',
    ];

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'DS khách hàng Tinh Long!A2:AC',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('Append response:', appendResponse.data);
    console.log('Data successfully added to Google Sheet');

    return NextResponse.json({ message: 'Data successfully added to Google Sheet' });
  } catch (error) {
    console.error('Error adding data to Google Sheets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rowIndex, data } = body;
    console.log('PUT request received:', { rowIndex, data });

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
      console.error('Missing Google Sheets environment variables');
      return NextResponse.json({ error: 'Missing Google Sheets environment variables' }, { status: 500 });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('Invalid GOOGLE_PRIVATE_KEY format');
      return NextResponse.json({ error: 'Invalid GOOGLE_PRIVATE_KEY format' }, { status: 500 });
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

    // Load all rows to find the correct row
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'DS khách hàng Tinh Long!A2:AC',
    });
    const allRows = getResponse.data.values || [];
    const actualRowIndex = rowIndex - 2; // Adjust for zero-based index and starting from A2
    if (actualRowIndex < 0 || actualRowIndex >= allRows.length) {
      console.error('Invalid rowIndex:', rowIndex);
      return NextResponse.json({ error: 'Invalid row index' }, { status: 400 });
    }

    const currentRow = allRows[actualRowIndex] || Array(29).fill('');
    console.log('Current row data before update:', currentRow);

    // Define column indices
    const updateMap = {
      name: 0,
      mobile: 1,
      source: 2,
      type: 3,
      demand: 4,
      area: 5,
      price: 6,
      product: 7,
      transactionStatus: 8,
      note: 9,
      email: 26,
      platforms: 27,
      purpose: 28,
    };

    // Prepare updated row
    const updatedRow = [...currentRow];
    for (const [key, index] of Object.entries(updateMap)) {
      if (data[key] !== undefined) {
        updatedRow[index] = data[key];
      }
    }

    // Update the row
    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `DS khách hàng Tinh Long!A${rowIndex}:AC${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('Update response:', updateResponse.data);
    console.log('Row updated successfully at index:', rowIndex, 'with data:', updatedRow);

    return NextResponse.json({ message: 'Data successfully updated in Google Sheet' });
  } catch (error) {
    console.error('Error updating data in Google Sheets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { rowIndex } = body;
    console.log('DELETE request received:', { rowIndex });

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
      console.error('Missing Google Sheets environment variables');
      return NextResponse.json({ error: 'Missing Google Sheets environment variables' }, { status: 500 });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('Invalid GOOGLE_PRIVATE_KEY format');
      return NextResponse.json({ error: 'Invalid GOOGLE_PRIVATE_KEY format' }, { status: 500 });
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

    // Get all rows to determine the total number of rows
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'DS khách hàng Tinh Long!A2:AC',
    });
    const allRows = getResponse.data.values || [];
    const actualRowIndex = rowIndex - 2; // Adjust for zero-based index and starting from A2
    if (actualRowIndex < 0 || actualRowIndex >= allRows.length) {
      console.error('Invalid rowIndex for deletion:', rowIndex);
      return NextResponse.json({ error: 'Invalid row index' }, { status: 400 });
    }

    // Get the data of the next row (rowIndex + 1)
    const nextRowIndex = rowIndex + 1;
    const getNextRowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `DS khách hàng Tinh Long!A${nextRowIndex}:AC${nextRowIndex}`,
    });
    const nextRow = getNextRowResponse.data.values?.[0] || Array(29).fill('');
    console.log('Next row data:', nextRow);

    // Update the current row with the next row's data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `DS khách hàng Tinh Long!A${rowIndex}:AC${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [nextRow],
      },
    });

    // Clear the last row
    const lastRowIndex = allRows.length + 1; // Adjust for A2 start
    if (lastRowIndex > rowIndex) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `DS khách hàng Tinh Long!A${lastRowIndex}:AC${lastRowIndex}`,
      });
      console.log('Cleared last row at index:', lastRowIndex);
    }

    console.log('Row deleted successfully at index:', rowIndex);

    return NextResponse.json({ message: 'Data successfully deleted from Google Sheet' });
  } catch (error) {
    console.error('Error deleting data from Google Sheets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}