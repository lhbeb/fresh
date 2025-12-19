import { NextResponse } from 'next/server';
import { shouldBypassAuth } from '@/lib/supabase/auth';

export async function GET() {
  const bypass = shouldBypassAuth();
  const nodeEnv = process.env.NODE_ENV;
  const disableAuth = process.env.DISABLE_AUTH_IN_DEV;
  
  return NextResponse.json({
    bypassEnabled: bypass,
    nodeEnv,
    disableAuthEnv: disableAuth,
    disableAuthType: typeof disableAuth,
    allAuthRelatedEnv: Object.keys(process.env)
      .filter(k => k.includes('AUTH') || k.includes('DISABLE'))
      .reduce((acc, key) => {
        acc[key] = process.env[key];
        return acc;
      }, {} as Record<string, string | undefined>)
  });
}




