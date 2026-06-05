import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { GlassCard } from "../../../_components/glass-card";

interface BasicInformationCardProps {
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  devId: string;
  setDevId: (val: string) => void;
}

export function BasicInformationCard({
  name,
  setName,
  description,
  setDescription,
  devId,
  setDevId,
}: BasicInformationCardProps) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Format Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Predict Outcome"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe how this game format works..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Developer Game ID</Label>
          <Input
            value={devId}
            onChange={(e) => setDevId(e.target.value)}
            placeholder="game_format_v1"
            className="font-mono text-sm"
          />
          <p className="text-muted-foreground text-xs">
            The key that links this to the backend code
          </p>
        </div>
      </CardContent>
    </GlassCard>
  );
}
