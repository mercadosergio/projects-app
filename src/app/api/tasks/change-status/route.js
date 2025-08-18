import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const { id, status } = await req.json();

    return NextResponse.json({ id, status }, { status: 200 });
  } catch (error) {
    return ErrorResponse(error.message);
  }
}
