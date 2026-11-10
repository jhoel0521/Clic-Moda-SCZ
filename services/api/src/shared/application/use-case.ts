// Contrato de todo caso de uso: una clase, un método, entrada y salida tipadas.
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
