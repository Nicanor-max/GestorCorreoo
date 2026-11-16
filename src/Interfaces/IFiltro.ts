import { ICorreoConsulta } from './ICorreoConsulta';
import { Predicado } from './IPredicado';

export interface IFiltro {
  getNombre(): string;
  getPredicado(): Predicado;
  cumple(correo: ICorreoConsulta): boolean;
  aplicar(correos: ICorreoConsulta[]): ICorreoConsulta[];
}