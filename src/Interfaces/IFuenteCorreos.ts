import { TipoBandeja } from '../tipobandeja';
import { ICorreoConsulta } from './ICorreoConsulta';

// Solo lectura: lo que necesitan la búsqueda y la vista de favoritos
export interface IFuenteCorreos {
  listarActivos(): ICorreoConsulta[];
  listarDe(tipo: TipoBandeja): ICorreoConsulta[];
}