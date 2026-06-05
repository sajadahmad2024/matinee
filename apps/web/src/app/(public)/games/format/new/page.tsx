"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

import { FormatHeader } from "../_components/format-header";
import { BasicInformationCard } from "../_components/settings/basic-information-card";
import { LeaderboardRewardsCard } from "../_components/settings/leaderboard-rewards-card";

export default function NewGameFormatPage() {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [devId, setDevId] = useState("");
  const [enableDefaultRewards, setEnableDefaultRewards] = useState(true);
  const [topPlayersToReward, setTopPlayersToReward] = useState(3);
  const [bonusPoints, setBonusPoints] = useState(100);

  const handleSave = () => {
    toast.success("Game format created successfully");
  };

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <FormatHeader name={name} isNew={true} onSave={handleSave} formatIcon={Gamepad2} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BasicInformationCard
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          devId={devId}
          setDevId={setDevId}
        />

        <LeaderboardRewardsCard
          enableDefaultRewards={enableDefaultRewards}
          setEnableDefaultRewards={setEnableDefaultRewards}
          topPlayersToReward={topPlayersToReward}
          setTopPlayersToReward={setTopPlayersToReward}
          bonusPoints={bonusPoints}
          setBonusPoints={setBonusPoints}
        />
      </div>
    </div>
  );
}
