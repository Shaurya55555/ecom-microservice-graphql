"use client";

import { useMutation } from "@apollo/client/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { CREATE_PRODUCT, UPDATE_PRODUCT } from "@/lib/graphql/mutations";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { CATEGORY_NAMES } from "@/lib/categories";
import { productSchema, type ProductFormValues } from "@/lib/validation/schemas";
import type { Product } from "@/lib/types";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ProductImage } from "@/components/product/ProductImage";

/** Create/edit form. The parent remounts it (via `key`) when the product being edited changes. */
export function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const editing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      category: product?.category || "General",
      imageUrl: product?.imageUrl ?? "",
    },
  });

  const [preview, previewName, previewCategory] = useWatch({
    control,
    name: ["imageUrl", "name", "category"],
  });

  async function onSubmit(values: ProductFormValues) {
    const variables = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      category: values.category,
      imageUrl: values.imageUrl,
    };
    try {
      if (product) {
        await updateProduct({ variables: { id: product.id, ...variables }, refetchQueries: [GET_PRODUCTS] });
        toast.success("Product updated");
        onDone();
      } else {
        await createProduct({ variables, refetchQueries: [GET_PRODUCTS] });
        toast.success("Product listed");
        reset({ name: "", description: "", price: "", category: "General", imageUrl: "" });
      }
    } catch (err) {
      toast.error(friendlyError(err, "Couldn't save the product."));
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        {editing ? (
          <Pencil className="h-4 w-4 text-brand-text" strokeWidth={2} aria-hidden />
        ) : (
          <PackagePlus className="h-4 w-4 text-brand-text" strokeWidth={2} aria-hidden />
        )}
        <h2 className="text-base font-semibold text-fg">{editing ? "Edit product" : "List a new product"}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <Textarea label="Description" rows={4} error={errors.description?.message} {...register("description")} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            error={errors.price?.message}
            {...register("price")}
          />
          <Select label="Category" error={errors.category?.message} {...register("category")}>
            {CATEGORY_NAMES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Image URL (optional)"
          type="url"
          placeholder="https://…"
          hint="Leave blank for a category illustration."
          error={errors.imageUrl?.message}
          {...register("imageUrl")}
        />

        <ProductImage
          src={errors.imageUrl ? null : preview}
          alt="Preview"
          category={previewCategory}
          seed={previewName || "new"}
          className="aspect-[16/7] w-full rounded-xl border border-line"
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            {isSubmitting ? "Saving…" : editing ? "Save changes" : "List product"}
          </Button>
          {editing && (
            <Button variant="secondary" onClick={onDone} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
