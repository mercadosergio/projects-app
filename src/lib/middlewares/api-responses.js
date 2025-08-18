import { NextResponse } from 'next/server';

export const HttpResponse = (data, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const ErrorResponse = (message, status = 500) =>
  NextResponse.json({ success: false, error: message }, { status });
