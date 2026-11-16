import { TipoBandeja } from '../TipoBandeja';
import { ICorreoConsulta } from './ICorreoConsulta';
import { IFiltro } from './IFiltro';

export interface IGestorFiltros {
  registrar(filtro: IFiltro): void;
  obtener(nombre: string): IFiltro;
  eliminar(nombre: string): boolean;
  listar(): IFiltro[];
  cantidad(): number;
  aplicar(nombre: string, correos: ICorreoConsulta[]): ICorreoConsulta[];
  aplicarEn(nombre: string, tipo: TipoBandeja): ICorreoConsulta[];
  aplicarEnActivos(nombre: string): ICorreoConsulta[];
}