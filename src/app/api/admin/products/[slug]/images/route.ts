import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

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


