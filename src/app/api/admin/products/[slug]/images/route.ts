import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfuedgrheyncotoxseos.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdWVkZ3JoZXluY290b3hzZW9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAzMDM4MCwiZXhwIjoyMDc3NjA2MzgwfQ.gxykjdi3SsfnFaFTocKa0k9ddrxF9PcvJCShqp2UD5Q';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const BUCKET = 'product-images';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug provided.' },
        { status: 400 }
      );
    }

    const folder = slug.trim();

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Supabase list error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to list images.' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const images = data
      .filter((file) => !file.name?.startsWith('.') && !file?.metadata?.isFolder)
      .map((file) => {
        const path = `${folder}/${file.name}`;
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
        return publicUrl;
      })
      .filter(Boolean);

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Resync images error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resync images.' },
      { status: 500 }
    );
  }
}


