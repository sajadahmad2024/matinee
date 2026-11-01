import type { CustomSelectOption } from "@/components/custom/custom-select";

/**
 * Fields every library row shares — studio / genre / tag / person DTOs all have them, so the
 * manager renders SDK rows directly.
 */
export interface TaxonomyRow {
  id: string;
  name: string;
  contentCount: number;
}

/** Reads a row's meta value (studio country code, person role); omitted for genres and tags. */
export type TaxonomyMetaGetter<T> = (row: T) => string | null | undefined;

/** Reads a row's image URL (studio `logoUrl`, person `photoUrl`); omitted for genres and tags. */
export type TaxonomyImageGetter<T> = (row: T) => string | null | undefined;

/**
 * Callbacks the manager hands a tab for each save / delete / toggle. The tab forwards them to
 * `mutation.mutate(variables, callbacks)`, so the manager owns the toasts: the API's `message`
 * when there is one, our copy otherwise.
 */
export interface TaxonomyMutationCallbacks {
  onSuccess: (response?: { message?: string }) => void;
  onError: (error?: { message?: string }) => void;
}

/**
 * What the add/edit modal submits; `meta` is empty when unset. `image` is the shown image (the
 * saved URL, or a preview of `imageFile`) — unset after "Remove".
 */
export interface TaxonomyFormValues {
  name: string;
  meta: string;
  image?: string;
  imageFile?: File;
}

/**
 * The media-id change to send on save: the uploaded file's id, `null` when the saved image was
 * removed, or `undefined` (omit — unchanged).
 */
export const imageMediaIdChange = (
  { image, imageFile }: Pick<TaxonomyFormValues, "image" | "imageFile">,
  hadImage: boolean,
  uploadedId?: string,
): string | null | undefined => {
  if (imageFile) return uploadedId;
  if (hadImage && !image) return null;
  return undefined;
};

/** "Min-jun Kim" → "MK". */
export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Display text for a meta value — its option label when options are given, else the raw value. */
export const metaText = (value?: string | null, options?: CustomSelectOption[]) => {
  const label = value ? options?.find((o) => o.value === value)?.label : undefined;
  return typeof label === "string" ? label : (value ?? undefined);
};
