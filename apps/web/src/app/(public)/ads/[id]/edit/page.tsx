import type { Metadata } from "next";

import { EditAdClient } from "./_components/edit-ad-client";

export const metadata: Metadata = {
  title: "Edit Ad",
  description: "Change a feed ad's video, copy, regions, feed ranks and schedule.",
};

interface EditAdPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdPage({ params }: EditAdPageProps) {
  const { id } = await params;
  return <EditAdClient id={decodeURIComponent(id)} />;
}
