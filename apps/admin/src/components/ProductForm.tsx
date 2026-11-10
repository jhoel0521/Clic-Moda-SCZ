import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../lib/client-api';
import {
  createProduct,
  draftFrom,
  emptyDraft,
  newVariant,
  skuErrorFor,
  updateProduct,
  validate,
  type Errors,
  type ProductDraft,
  type VariantDraft,
} from '../lib/product-form';
import { errorMessage, type Category, type Product } from '../lib/types';
import { Button, ErrorBanner, Field, SelectField } from './ui';

async function loadProduct(productId: string | undefined): Promise<Product | null> {
  return productId ? api<Product>('GET', `catalog/products/${productId}`) : null;
}

function useLoaded(productId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saved, setSaved] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        setCategories(await api<Category[]>('GET', 'catalog/categories'));
        const product = await loadProduct(productId);
        setSaved(product);
        if (product) setDraft(draftFrom(product));
      } catch (failure) {
        setLoadError(errorMessage(failure));
      }
    };
    void load();
  }, [productId]);
  return { categories, saved, draft, setDraft, loadError };
}

async function persist(productId: string | undefined, saved: Product | null, draft: ProductDraft) {
  if (productId && saved) await updateProduct(productId, draft, saved);
  else await createProduct(draft);
  window.location.assign('/productos');
}

function useSave(productId: string | undefined, saved: Product | null, draft: ProductDraft) {
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fail = (failure: unknown) => {
    const message = errorMessage(failure);
    const field = failure instanceof ApiError ? skuErrorFor(message, draft) : null;
    if (field) setErrors(field);
    else setServerError(message);
    setBusy(false);
  };
  const save = async () => {
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    setServerError(null);
    await persist(productId, saved, draft).catch(fail);
  };
  return { errors, serverError, busy, save };
}

interface RowProps {
  variant: VariantDraft;
  errors: Errors;
  onChange: (changes: Partial<VariantDraft>) => void;
}

function VariantFields({ variant, errors, onChange }: RowProps) {
  const error = (field: string) => errors[`${variant.key}.${field}`];
  const text = (key: keyof VariantDraft) => (e: { target: { value: string } }) =>
    onChange({ [key]: e.target.value });
  return (
    <>
      <Field label="Talla" value={variant.size} error={error('size')} onChange={text('size')} />
      <Field label="Color" value={variant.color} onChange={text('color')} />
      <Field
        label="SKU (opcional)"
        value={variant.sku}
        error={error('sku')}
        onChange={text('sku')}
      />
      <Field
        label="Precio (Bs)"
        inputMode="decimal"
        value={variant.price}
        error={error('price')}
        onChange={text('price')}
      />
    </>
  );
}

interface ExtrasProps {
  variant: VariantDraft;
  canRemove: boolean;
  onChange: (changes: Partial<VariantDraft>) => void;
  onRemove: () => void;
}

// Una variante existente se activa o desactiva (no se borra); una nueva se puede quitar.
function VariantExtras({ variant, canRemove, onChange, onRemove }: ExtrasProps) {
  if (variant.id) {
    return (
      <label className="flex min-h-11 items-center gap-2 self-end">
        <input
          type="checkbox"
          checked={variant.active}
          onChange={(e) => onChange({ active: e.target.checked })}
        />
        Activa
      </label>
    );
  }
  return (
    <Button variant="secondary" className="self-end" disabled={!canRemove} onClick={onRemove}>
      Quitar
    </Button>
  );
}

function VariantRow(props: RowProps & ExtrasProps) {
  return (
    <li className="border-line bg-surface grid gap-3 rounded-lg border p-3 sm:grid-cols-5">
      <VariantFields variant={props.variant} errors={props.errors} onChange={props.onChange} />
      <VariantExtras
        variant={props.variant}
        canRemove={props.canRemove}
        onChange={props.onChange}
        onRemove={props.onRemove}
      />
    </li>
  );
}

interface SectionProps {
  draft: ProductDraft;
  errors: Errors;
  onDraft: (draft: ProductDraft) => void;
}

function VariantList({ draft, errors, onDraft }: SectionProps) {
  const change = (key: string, changes: Partial<VariantDraft>) =>
    onDraft({
      ...draft,
      variants: draft.variants.map((v) => (v.key === key ? { ...v, ...changes } : v)),
    });
  const remove = (key: string) =>
    onDraft({ ...draft, variants: draft.variants.filter((v) => v.key !== key) });
  return (
    <ul className="flex flex-col gap-3">
      {draft.variants.map((variant) => (
        <VariantRow
          key={variant.key}
          variant={variant}
          errors={errors}
          canRemove={draft.variants.length > 1}
          onChange={(changes) => change(variant.key, changes)}
          onRemove={() => remove(variant.key)}
        />
      ))}
    </ul>
  );
}

function VariantsSection({ draft, errors, onDraft }: SectionProps) {
  const add = () => onDraft({ ...draft, variants: [...draft.variants, newVariant()] });
  return (
    <section aria-labelledby="variantes" className="flex flex-col gap-3">
      <h2 id="variantes" className="text-lg font-semibold">
        Variantes (talla, color y precio)
      </h2>
      {errors.variants && <ErrorBanner>{errors.variants}</ErrorBanner>}
      <VariantList draft={draft} errors={errors} onDraft={onDraft} />
      <Button variant="secondary" className="self-start" onClick={add}>
        Agregar variante
      </Button>
    </section>
  );
}

interface FieldsProps extends SectionProps {
  categories: Category[];
}

interface CategoryFieldProps {
  value: string;
  error?: string;
  categories: Category[];
  onChange: (value: string) => void;
}

function CategoryField({ value, error, categories, onChange }: CategoryFieldProps) {
  const options = categories.map((category) => ({ value: category.id, label: category.name }));
  return (
    <SelectField
      label="Categoría"
      value={value}
      error={error}
      options={options}
      placeholder="Elige una"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ProductFields({ draft, errors, categories, onDraft }: FieldsProps) {
  const set = (changes: Partial<ProductDraft>) => onDraft({ ...draft, ...changes });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Nombre"
        value={draft.name}
        error={errors.name}
        maxLength={120}
        onChange={(e) => set({ name: e.target.value })}
      />
      <CategoryField
        value={draft.categoryId}
        error={errors.categoryId}
        categories={categories}
        onChange={(categoryId) => set({ categoryId })}
      />
      <DescriptionField
        value={draft.description}
        onChange={(description) => set({ description })}
      />
    </div>
  );
}

function DescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <Field
        label="Descripción (opcional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FormActions({ busy }: { busy: boolean }) {
  return (
    <div className="flex gap-3">
      <Button type="submit" disabled={busy}>
        {busy ? 'Guardando…' : 'Guardar producto'}
      </Button>
      <a
        href="/productos"
        className="border-border bg-surface flex min-h-11 items-center rounded-lg border px-4 font-semibold"
      >
        Cancelar
      </a>
    </div>
  );
}

export default function ProductForm({ productId }: { productId?: string }) {
  const { categories, saved, draft, setDraft, loadError } = useLoaded(productId);
  const { errors, serverError, busy, save } = useSave(productId, saved, draft);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void save();
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {(loadError || serverError) && <ErrorBanner>{loadError ?? serverError}</ErrorBanner>}
      <ProductFields draft={draft} errors={errors} categories={categories} onDraft={setDraft} />
      <VariantsSection draft={draft} errors={errors} onDraft={setDraft} />
      <FormActions busy={busy} />
    </form>
  );
}
