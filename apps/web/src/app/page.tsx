import { redirect } from "next/navigation";

import { ROUTES } from "@/app/_libs/constants/routes";

export default function Home() {
  redirect(ROUTES.AUTH.LOGIN);
}
