import type {
  MediaReference,
  MediaReferencesPort,
} from '../application/ports/media-references.port.js';

// Doble del puerto hacia medios: solo "conoce" las imágenes que se le agregan y cuenta cuántas consultas recibe.
export class FakeMediaReferences implements MediaReferencesPort {
  private readonly known = new Map<string, MediaReference>();
  calls = 0;

  add(reference: MediaReference): this {
    this.known.set(reference.id, reference);
    return this;
  }

  remove(id: string): void {
    this.known.delete(id);
  }

  findPublished(ids: readonly string[]): Promise<MediaReference[]> {
    this.calls += 1;
    return Promise.resolve(ids.flatMap((id) => this.known.get(id) ?? []));
  }
}
