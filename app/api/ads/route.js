import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, rowIndex, adContent, photoUrl, demand, product, area, name, phone, budget, note, purpose } = body;

    if (!adId) {
      return NextResponse.json({ error: 'Missing adId' }, { status: 400 });
    }

    await setDoc(doc(db, 'ads', adId), {
      adId,
      rowIndex,
      adContent,
      photoUrl,
      demand,
      product,
      area,
      name,
      phone,
      budget,
      note,
      purpose,
      createdAt: new Date().toISOString(),
    });

    console.log('Ad saved to Firestore:', adId);
    return NextResponse.json({ message: 'Ad saved successfully', adId });
  } catch (error) {
    console.error('Error saving ad:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const adId = url.searchParams.get('adId');

    if (!adId) {
      return NextResponse.json({ error: 'Missing adId' }, { status: 400 });
    }

    const docRef = doc(db, 'ads', adId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json(docSnap.data());
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}