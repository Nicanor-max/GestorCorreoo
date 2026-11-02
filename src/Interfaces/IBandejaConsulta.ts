import { TipoBandeja } from '../tipobandeja';
import { ICorreoConsulta } from './ICorreoConsulta';

export interface IBandejaConsulta {
  getTipo(): TipoBandeja;
  listar(): ICorreoConsulta[];
  buscarPorId(id: string): ICorreoConsulta | null;
  contiene(id: string): boolean;
  cantidad(): number;
}