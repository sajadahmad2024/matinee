import { Globe, type LucideIcon, Star, Users, Zap } from "lucide-react";

import { BoostContentDtoChannelsEnum as BoostChannel } from "@/app/_libs/api/generated";

/**
 * Boost channels: the boost modal's options and the details page's labels. Keyed by the API's
 * enum, so a new channel fails the type check until it gets a label.
 */
export const BOOST_CHANNELS: Record<
  BoostChannel,
  { label: string; icon: LucideIcon; description: string }
> = {
  [BoostChannel.Homepage]: {
    label: "Homepage Featured",
    icon: Star,
    description: "Show on homepage carousel",
  },
  [BoostChannel.Notifications]: {
    label: "Push Notifications",
    icon: Zap,
    description: "Send to all users",
  },
  [BoostChannel.Regional]: {
    label: "Regional Boost",
    icon: Globe,
    description: "Priority in user's region",
  },
  [BoostChannel.Subscribers]: {
    label: "Subscribers First",
    icon: Users,
    description: "Notify subscribed users first",
  },
};
