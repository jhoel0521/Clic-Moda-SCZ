import { useEffect, useState } from 'react';
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
import { Button, Card, ErrorBanner, Field, SelectField } from './ui';

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
  const text = (key: keyof VariantDraft) => (e: { target: { value: string } }) => onChange({ [key]: e.target.value });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Talla" value={variant.size} error={error('size')} onChange={text('size')} />
      <Field label="Color" value={variant.color} onChange={text('color')} />
      <Field
        label="Precio (Bs)"
        inputMode="decimal"
        value={variant.price}
        error={error('price')}
        onChange={text('price')}
      />
      <Field
        label="SKU (opcional)"
        autoCapitalize="characters"
        value={variant.sku}
        error={error('sku')}
        onChange={text('sku')}
      />
    </div>
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
      <label className="flex min-h-12 items-center gap-3 font-medium">
        <input
          type="checkbox"
          className="size-6 accent-[#c7305a]"
          checked={variant.active}
          onChange={(e) => onChange({ active: e.target.checked })}
        />
        Variante activa
      </label>
    );
  }
  return (
    <Button variant="ghost" icon="trash" disabled={!canRemove} onClick={onRemove}>
      Quitar variante
    </Button>
  );
}

function VariantCard(props: RowProps & ExtrasProps & { index: number }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <p className="text-muted text-sm font-semibold">Variante {props.index + 1}</p>
      <VariantFields variant={props.variant} errors={props.errors} onChange={props.onChange} />
      <VariantExtras
        variant={props.variant}
        canRemove={props.canRemove}
        onChange={props.onChange}
        onRemove={props.onRemove}
      />
    </Card>
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
  const remove = (key: string) => onDraft({ ...draft, variants: draft.variants.filter((v) => v.key !== key) });
  return (
    <ul className="flex flex-col gap-3">
      {draft.variants.map((variant, index) => (
        <li key={variant.key}>
          <VariantCard
            index={index}
            variant={variant}
            errors={errors}
            canRemove={draft.variants.length > 1}
            onChange={(c) => change(variant.key, c)}
            onRemove={() => remove(variant.key)}
          />
        </li>
      ))}
    </ul>
  );
}

function VariantsSection({ draft, errors, onDraft }: SectionProps) {
  const add = () => onDraft({ ...draft, variants: [...draft.variants, newVariant()] });
  return (
    <section aria-labelledby="variantes" className="flex flex-col gap-3">
      <h2 id="variantes" className="text-lg font-bold">
        Tallas, colores y precios
      </h2>
      {errors.variants && <ErrorBanner>{errors.variants}</ErrorBanner>}
      <VariantList draft={draft} errors={errors} onDraft={onDraft} />
      <Button variant="secondary" icon="plus" block onClick={add}>
        Agregar otra variante
      </Button>
    </section>
  );
}

interface FieldsProps extends SectionProps {
  categories: Category[];
}

function CategoryField(props: {
  value: string;
  error?: string;
  categories: Category[];
  onChange: (value: string) => void;
}) {
  const options = props.categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  return (
    <SelectField
      label="Categoría"
      value={props.value}
      error={props.error}
      options={options}
      placeholder="Elige una"
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

function ProductFields({ draft, errors, categories, onDraft }: FieldsProps) {
  const set = (changes: Partial<ProductDraft>) => onDraft({ ...draft, ...changes });
  return (
    <Card className="flex flex-col gap-4 p-4">
      <Field
        label="Nombre del producto"
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
      <Field
        label="Descripción (opcional)"
        value={draft.description}
        onChange={(e) => set({ description: e.target.value })}
      />
    </Card>
  );
}

// Barra de guardado pegada sobre la barra de navegación inferior: siempre al alcance del pulgar.
function SaveBar({ busy }: { busy: boolean }) {
  return (
    <div className="glass border-line sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 flex gap-3 border-t p-3 md:bottom-0 md:mx-0 md:rounded-2xl md:border">
      <a
        href="/productos"
        className="border-border bg-surface inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border font-semibold"
      >
        Cancelar
      </a>
      <Button type="submit" className="flex-[2]" disabled={busy}>
        {busy ? 'Guardando…' : 'Guardar producto'}
      </Button>
    </div>
  );
}

export default function ProductForm({ productId }: { productId?: string }) {
  const { categories, saved, draft, setDraft, loadError } = useLoaded(productId);
  const { errors, serverError, busy, save } = useSave(productId, saved, draft);
  const onSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    void save();
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {(loadError || serverError) && <ErrorBanner>{loadError ?? serverError}</ErrorBanner>}
      <ProductFields draft={draft} errors={errors} categories={categories} onDraft={setDraft} />
      <VariantsSection draft={draft} errors={errors} onDraft={setDraft} />
      <SaveBar busy={busy} />
    </form>
  );
}
