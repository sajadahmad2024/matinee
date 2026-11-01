"use client";

import { useRef, useState } from "react";

import { ImagePlus, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import { CustomButton } from "@/components/custom/custom-button";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";

import { TAXONOMY_COPY, TAXONOMY_IMAGE_RULES } from "../../_shared/taxonomy-config";
import { type TaxonomyFormValues, initials } from "../../_shared/taxonomy-types";

interface TaxonomyItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row being edited, as form values; `null` → add. Remounted per open, so fields start from it. */
  initialValues: TaxonomyFormValues | null;
  noun: string;
  metaLabel?: string;
  metaOptions?: CustomSelectOption[];
  /** Shows the uploader; omit to hide it. */
  imageLabel?: string;
  isSaving: boolean;
  onSubmit: (values: TaxonomyFormValues) => void;
}

/** Add / edit one library item: name, plus the tab's optional meta and image fields. */
export function TaxonomyItemModal({
  open,
  onOpenChange,
  initialValues,
  noun,
  metaLabel,
  metaOptions,
  imageLabel,
  isSaving,
  onSubmit,
}: TaxonomyItemModalProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [meta, setMeta] = useState(initialValues?.meta ?? "");
  const [image, setImage] = useState<string | null>(initialValues?.image ?? null);
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imageError, setImageError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  /** Rejects non-image / oversize files before they're uploaded. */
  const pickImage = (file?: File) => {
    if (!file) return;
    if (!(TAXONOMY_IMAGE_RULES.mimeTypes as readonly string[]).includes(file.type)) {
      setImageError(TAXONOMY_COPY.imageType);
      return;
    }
    if (file.size > TAXONOMY_IMAGE_RULES.maxBytes) {
      setImageError(TAXONOMY_COPY.imageTooLarge);
      return;
    }
    setImageError(undefined);
    setImage(URL.createObjectURL(file));
    setImageFile(file);
  };

  const isDirty =
    !initialValues ||
    name.trim() !== initialValues.name.trim() ||
    meta.trim() !== (initialValues.meta ?? "").trim() ||
    !!imageFile ||
    (image ?? undefined) !== initialValues.image;
  const canSubmit = !!name.trim() && isDirty;

  const submit = () => {
    if (!canSubmit || isSaving) return;
    onSubmit({ name: name.trim(), meta: meta.trim(), image: image ?? undefined, imageFile });
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      appearance="default"
      className="border-border bg-card max-w-md"
      title={initialValues ? `Edit ${noun}` : `Add ${noun}`}
      footer={
        <>
          <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={submit}
            disabled={!canSubmit}
            isLoading={isSaving}
            loadingText="Saving...">
            {initialValues ? "Save changes" : `Create ${noun}`}
          </CustomButton>
        </>
      }>
      <div className="space-y-4">
        {imageLabel && (
          <CustomField label={imageLabel} helperText={TAXONOMY_COPY.imageHint} error={imageError}>
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 rounded-lg">
                <AvatarImage src={image ?? undefined} alt="" className="object-cover" />
                <AvatarFallback className="bg-primary/15 text-primary rounded-lg">
                  {name.trim() ? initials(name) : <ImagePlus className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileRef}
                type="file"
                accept={TAXONOMY_IMAGE_RULES.mimeTypes.join(",")}
                className="hidden"
                onChange={(e) => {
                  pickImage(e.target.files?.[0] ?? undefined);
                  // Clear so picking the same file again (after a rejection) fires onChange.
                  e.target.value = "";
                }}
              />
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}>
                Upload
              </CustomButton>
              {image && (
                <CustomButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={() => {
                    setImage(null);
                    setImageError(undefined);
                    setImageFile(undefined);
                  }}>
                  Remove
                </CustomButton>
              )}
            </div>
          </CustomField>
        )}
        <CustomField label={`${noun} name`} htmlFor="taxonomy-name">
          <Input
            id="taxonomy-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${noun} name`}
          />
        </CustomField>
        {metaLabel && (
          <CustomField label={metaLabel} htmlFor="taxonomy-meta">
            {metaOptions ? (
              <CustomSelect
                id="taxonomy-meta"
                options={metaOptions}
                value={meta || undefined}
                onValueChange={setMeta}
                disabled={!metaOptions?.length}
                placeholder={
                  metaOptions?.length
                    ? `Select ${metaLabel.toLowerCase()}`
                    : `No ${metaLabel.toLowerCase()} options available`
                }
                triggerClassName="cursor-pointer"
                contentClassName="border-border bg-card z-50 **:[[role=option]]:cursor-pointer"
              />
            ) : (
              <Input
                id="taxonomy-meta"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder={metaLabel}
              />
            )}
          </CustomField>
        )}
      </div>
    </CustomModal>
  );
}
