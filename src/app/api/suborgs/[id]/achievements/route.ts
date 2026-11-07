import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sub_org_id } = await params;
    
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('sub_org_id', sub_org_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: sub_org_id } = await params;
    const body = await req.json();

    const imageUrls = Array.isArray(body.image_urls) ? body.image_urls : (body.image_url ? [body.image_url] : []);
    const primaryUrl = imageUrls[0] || body.image_url || null;

    const fullPayload = {
      ...body,
      sub_org_id,
      image_urls: imageUrls,
      image_url: primaryUrl,
    };

    // Attempt 1: Full payload with image_urls and image_url
    let { data, error } = await supabase
      .from('achievements')
      .insert([fullPayload])
      .select()
      .single();

    // Attempt 2: If image_urls column is missing, try with only image_url
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const { image_urls: _, ...singleImagePayload } = fullPayload;
      const retry1 = await supabase
        .from('achievements')
        .insert([singleImagePayload])
        .select()
        .single();

      if (!retry1.error) {
        return NextResponse.json({
          data: retry1.data,
          warning: 'Saved with primary image. To store multiple images, run: ALTER TABLE achievements ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT \'{}\'; in Supabase.',
        });
      }

      // Attempt 3: If image_url also doesn't exist, save core title and description
      const { image_url: __, ...corePayload } = singleImagePayload;
      const retry2 = await supabase
        .from('achievements')
        .insert([corePayload])
        .select()
        .single();

      if (retry2.error) throw retry2.error;
      return NextResponse.json({
        data: retry2.data,
        warning: 'Achievement text saved! To enable photos, run: ALTER TABLE achievements ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT \'{}\', ADD COLUMN IF NOT EXISTS image_url TEXT; in Supabase.',
      });
    }

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
