import { NextResponse } from 'next/server';
import { fetchActiveFunnels } from '@/lib/exactspotter/funnels';

export async function GET() {
  try {
    const funnels = await fetchActiveFunnels();
    const value = funnels.map((funnel) => ({
      id: funnel.id,
      name: funnel.name,
    }));
    return NextResponse.json({ value });
  } catch (error) {
    return NextResponse.json({ value: [] }, { status: 200 });
  }
}
