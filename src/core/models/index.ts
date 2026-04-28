/**
 * Barrel de modelos del dominio.
 * Importar siempre desde '@/core/models' para mantener la coherencia.
 */
export type { IImage, IUser, ILoginCredentials, IRegisterData } from './IUser';

export type {
  IProduct,
  IProductFilters,
  IImage as ProductImage,
  MedidasDinamicas,
  Talla,
  CategoriaProducto,
} from './IProduct';

export type {
  IOrder,
  IOrderItem,
  ICartItem,
  IShippingAddress,
  MetodoPago,
} from './IOrder';
