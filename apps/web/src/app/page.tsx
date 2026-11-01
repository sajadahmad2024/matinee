import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/app/_libs/constants/routes";

export default function Home() {
  redirect(AUTH_ROUTES.LOGIN);
}
