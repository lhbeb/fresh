import SearchPageClient from '@/components/SearchPageClient';

interface SearchPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.query || '';

  return <SearchPageClient initialQuery={query} />;
} 