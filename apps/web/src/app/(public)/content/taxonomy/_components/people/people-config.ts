import { PersonKnownFor, PersonKnownForEnum } from "@/app/_libs/hooks/api/use-content-taxonomy";
import type { CustomSelectOption } from "@/components/custom/custom-select";

/** Role select — values are the API's `knownFor` enum. */
export const PERSON_ROLE_OPTIONS = [
  { value: PersonKnownForEnum.Actor, label: "Actor" },
  { value: PersonKnownForEnum.Director, label: "Director" },
  { value: PersonKnownForEnum.Writer, label: "Writer" },
  { value: PersonKnownForEnum.Producer, label: "Producer" },
  { value: PersonKnownForEnum.Other, label: "Other" },
];

/** Role filter (`knownFor`) — "All roles" sends no filter. */
export const ALL_ROLES = "all";
export type PersonRoleFilter = PersonKnownFor | typeof ALL_ROLES;

export const PERSON_ROLE_FILTER_OPTIONS: CustomSelectOption<PersonRoleFilter>[] = [
  { value: ALL_ROLES, label: "All roles" },
  { value: PersonKnownFor.Actor, label: "Actors" },
  { value: PersonKnownFor.Director, label: "Directors" },
  { value: PersonKnownFor.Writer, label: "Writers" },
  { value: PersonKnownFor.Producer, label: "Producers" },
  { value: PersonKnownFor.Other, label: "Other" },
];
