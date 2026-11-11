import type {
  MediaReference,
  MediaReferencesPort,
} from '../application/ports/media-references.port.js';

// Doble del puerto hacia medios: solo "conoce" las imágenes que se le agregan.
export class FakeMediaReferences implements MediaReferencesPort {
  private readonly known = new Map<string, MediaReference>();

  add(reference: MediaReference): this {
    this.known.set(reference.id, reference);
    return this;
  }

  remove(id: string): void {
    this.known.delete(id);
  }

  find(id: string): Promise<MediaReference | null> {
    return Promise.resolve(this.known.get(id) ?? null);
  }
}
