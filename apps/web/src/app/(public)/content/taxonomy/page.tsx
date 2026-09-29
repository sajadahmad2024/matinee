import { TaxonomyView } from "./_components/taxonomy-view";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}
export default async function TaxonomyPage({ searchParams }: PageProps) {
  await searchParams;
  return <TaxonomyView />;
}
