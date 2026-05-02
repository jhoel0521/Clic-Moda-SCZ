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
  ICreateOrderInput,
} from './IOrder';
export type { OrderStatus } from '@src/core/constants/ORDER_STATUS';

export type {
  ICuponDescuento,
  IBannerPromocional,
  INotificacionEmail,
  IAplicacionCupon,
} from './IMarketing';

export type { IResena, IImagenResena, ICreateResenaData, EstadoModeracion } from './IResena';

export type { IFavorito } from './IFavorito';

export type { IEtiqueta } from './IEtiqueta';

export type { EstadoProducto } from './IProduct';
