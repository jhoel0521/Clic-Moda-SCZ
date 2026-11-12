import { useEffect, useState } from 'react';
import {
  defaultTypeCode,
  fetchMovementTypes,
  SEE_ALL,
  typeOptions,
  type MovementTypeItem,
} from '../lib/movement-types';
import { KIND_LABELS, type MovementKind } from '../lib/stock';
import { SelectField } from './ui';

interface Props {
  kind: MovementKind;
  value: string;
  onChange: (code: string) => void;
}

// Los tipos activos de la clase elegida. Si la lista no carga, el formulario sigue siendo usable con el
// tipo de sistema de la clase (nunca bloquea registrar un movimiento).
function useTypes(): MovementTypeItem[] {
  const [types, setTypes] = useState<MovementTypeItem[]>([]);
  useEffect(() => {
    let alive = true;
    fetchMovementTypes().then(
      (loaded) => alive && setTypes(loaded),
      () => alive && setTypes([])
    );
    return () => {
      alive = false;
    };
  }, []);
  return types;
}

// «Tipo» del movimiento: preseleccionado, máximo 7 opciones a la vez y «Ver todos» si hay más (Hick).
export default function MovementTypeSelect({ kind, value, onChange }: Props) {
  const types = useTypes();
  const [expanded, setExpanded] = useState(false);
  const options = typeOptions(types, kind, expanded);
  const shown = options.length > 0 ? options : [{ value: defaultTypeCode(kind), label: KIND_LABELS[kind] }];
  return (
    <SelectField
      label="Tipo"
      value={value}
      options={shown}
      onChange={(event) => (event.target.value === SEE_ALL ? setExpanded(true) : onChange(event.target.value))}
    />
  );
}
