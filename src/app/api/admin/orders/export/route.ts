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
  const { data, error } = await supabaseAdmin.from('orders').select('*');
  if (error) {
    return new NextResponse('Failed to fetch orders', { status: 500 });
  }
  const csv = toCsv(data || []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="orders.csv"',
    },
  });
}
