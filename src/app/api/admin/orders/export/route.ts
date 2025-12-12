import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => (
    typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))
      ? '"' + val.replace(/"/g, '""') + '"'
      : val ?? ''
  );
  const csv = [headers.join(',')].concat(
    rows.map(row => headers.map(h => escape(row[h])).join(','))
  ).join('\r\n');
  return csv;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversionFilter = searchParams.get('conversion'); // 'converted', 'not_converted', or null for all

  let query = supabaseAdmin.from('orders').select('*');

  // Apply conversion filter if specified
  if (conversionFilter === 'converted') {
    query = query.eq('is_converted', true);
  } else if (conversionFilter === 'not_converted') {
    query = query.or('is_converted.is.null,is_converted.eq.false');
  }

  const { data, error } = await query;

  if (error) {
    return new NextResponse('Failed to fetch orders', { status: 500 });
  }

  const csv = toCsv(data || []);
  
  // Generate filename based on filter
  let filename = 'orders.csv';
  if (conversionFilter === 'converted') {
    filename = 'orders-converted.csv';
  } else if (conversionFilter === 'not_converted') {
    filename = 'orders-not-converted.csv';
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
