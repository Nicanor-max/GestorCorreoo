import { TipoBandeja } from '../TipoBandeja';
import { ICorreoBandeja } from './ICorreoBandeja';

export interface IBandejaModificacion {
  recibir(correo: ICorreoBandeja, origen: TipoBandeja | null): void;
  obtener(id: string): ICorreoBandeja;
  quitar(id: string): ICorreoBandeja;
}