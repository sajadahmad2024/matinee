import { EditVideoForm } from "./_components/edit-video-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="animate-fade-in pb-24">
      <EditVideoForm id={id} />
    </div>
  );
}
