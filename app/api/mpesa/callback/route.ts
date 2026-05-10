import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  console.log('M-PESA CALLBACK:', JSON.stringify(body, null, 2))
  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
}