import { LuCheck, LuCircle } from "react-icons/lu";

import { AUTH_PASSWORD_RULES } from "@/app/_libs/schemas";
import { cn } from "@/app/_libs/utils/cn";

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

/** Live checklist of the new-password rules; each turns green as the password meets it. */
export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  return (
    <ul className={cn("grid gap-1 sm:grid-cols-2", className)} aria-label="Password requirements">
      {AUTH_PASSWORD_RULES?.map((rule) => {
        const met = rule.test(password ?? "");
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              met ? "text-success" : "text-muted-foreground",
            )}>
            {met ? (
              <LuCheck className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <LuCircle className="size-3 shrink-0" aria-hidden />
            )}
            <span>
              {rule.label}
              <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
