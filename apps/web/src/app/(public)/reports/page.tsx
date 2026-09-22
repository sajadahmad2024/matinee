import { ReportBuilder } from "./_components/report-builder";

export default function ReportManagementPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-gaming text-foreground text-3xl font-bold">Report Management</h1>
        <p className="text-foreground-secondary mt-1">
          Build and export reports for any stakeholder — pick a preset or select exactly the
          metrics you need.
        </p>
      </div>

      <ReportBuilder />
    </div>
  );
}
