import { TipoBandeja } from '../TipoBandeja';
import { ICorreoConsulta } from './ICorreoConsulta';
import { ICriterioBusqueda } from './ICriterioBusqueda';

export interface IBuscadorCorreos {
  buscar(texto: string): ICorreoConsulta[];
  buscarEn(tipo: TipoBandeja, texto: string): ICorreoConsulta[];
  buscarCon(criterio: ICriterioBusqueda, texto: string): ICorreoConsulta[];
}