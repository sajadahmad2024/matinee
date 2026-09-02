import { SectionHeading } from "@/components/custom/section-heading";

// One of the seven numbered analytics boxes — visibly bordered so each section reads
// as a distinct unit (the client's complaint last round was everything bleeding together).
interface RegionBoxProps {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function RegionBox({ id, number, title, subtitle, children }: RegionBoxProps) {
  return (
    <section id={id} className="border-border bg-card/40 scroll-mt-24 space-y-4 rounded-xl border p-4">
      <SectionHeading
        title={`${number}. ${title}`}
        subtitle={subtitle}
      />
      {children}
    </section>
  );
}
