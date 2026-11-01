import Link from "next/link";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import { GAME_ROUTES } from "../_libs/game-config";
import { FORMAT_SETTINGS_FORM_ID } from "./settings/format-settings-id";

/** Cancel / Save for a format page; Save submits the Settings tab's form. */
export function FormatHeaderActions() {
  return (
    <>
      <Button variant="outline" asChild>
        <Link href={GAME_ROUTES.LIST}>Cancel</Link>
      </Button>
      <Button type="submit" form={FORMAT_SETTINGS_FORM_ID}>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </>
  );
}
