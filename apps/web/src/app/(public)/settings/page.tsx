import { SettingsView } from "./_components/settings-view";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  await searchParams;
  return <SettingsView />;
}
