import { api } from './client-api';
import type { MovementKind } from './stock';

// Tipo de movimiento: el motivo del cambio de stock (un dato que el Gerente administra). La clase decide
// cómo cambia el stock; el código nunca cambia y lo genera el sistema a partir del nombre.
export interface MovementTypeItem {
  code: string;
  name: string;
  kind: MovementKind;
  active: boolean;
  system: boolean;
  createdAt: string;
}

export const fetchMovementTypes = (includeInactive = false): Promise<MovementTypeItem[]> =>
  api<MovementTypeItem[]>('GET', `inventory/movement-types${includeInactive ? '?includeInactive=true' : ''}`);

export const createMovementType = (name: string, kind: MovementKind): Promise<MovementTypeItem> =>
  api<MovementTypeItem>('POST', 'inventory/movement-types', { name, kind });

export const updateMovementType = (
  code: string,
  changes: { name?: string; active?: boolean }
): Promise<MovementTypeItem> => api<MovementTypeItem>('PATCH', `inventory/movement-types/${code}`, changes);

// Hick: a la vez se ven como máximo 7 opciones. Con más tipos se muestran los 6 primeros (el de sistema
// primero, luego por fecha de creación) y la séptima opción es «Ver todos».
export const MAX_OPTIONS = 7;
export const SEE_ALL = '__all__';

export interface TypeOption {
  value: string;
  label: string;
}

export function typeOptions(types: MovementTypeItem[], kind: MovementKind, expanded: boolean): TypeOption[] {
  const ofKind = types.filter((type) => type.active && type.kind === kind);
  const options = ofKind.map((type) => ({ value: type.code, label: type.name }));
  if (expanded || options.length <= MAX_OPTIONS) return options;
  return [...options.slice(0, MAX_OPTIONS - 1), { value: SEE_ALL, label: `Ver todos (${options.length})` }];
}

// El tipo con el que arranca el formulario: el de sistema de la clase (su código es el de la clase).
export const defaultTypeCode = (kind: MovementKind): string => kind;

// Las tres clases con su nombre en plural (pestañas) y en singular (textos). Orden fijo.
export const CLASS_TABS: { kind: MovementKind; plural: string; singular: string }[] = [
  { kind: 'RECEIVE', plural: 'Ingresos', singular: 'ingreso' },
  { kind: 'WITHDRAW', plural: 'Retiros', singular: 'retiro' },
  { kind: 'ADJUST', plural: 'Ajustes', singular: 'ajuste' },
];

export const typesOfKind = (types: MovementTypeItem[], kind: MovementKind): MovementTypeItem[] =>
  types.filter((type) => type.kind === kind);
