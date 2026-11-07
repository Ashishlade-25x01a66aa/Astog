import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id } = await params;

    const imageUrls = Array.isArray(body.image_urls) ? body.image_urls : (body.image_url ? [body.image_url] : []);
    const primaryUrl = imageUrls[0] || body.image_url || null;

    const fullPayload = {
      ...body,
      image_urls: imageUrls,
      image_url: primaryUrl,
    };

    let { data, error } = await supabase
      .from('achievements')
      .update(fullPayload)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const { image_urls: _, ...singlePayload } = fullPayload;
      const retry1 = await supabase
        .from('achievements')
        .update(singlePayload)
        .eq('id', id)
        .select()
        .single();

      if (!retry1.error) {
        return NextResponse.json({ data: retry1.data });
      }

      const { image_url: __, ...corePayload } = singlePayload;
      const retry2 = await supabase
        .from('achievements')
        .update(corePayload)
        .eq('id', id)
        .select()
        .single();

      if (retry2.error) throw retry2.error;
      return NextResponse.json({ data: retry2.data });
    }

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await params;

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
