import { TipoBandeja } from '../TipoBandeja';
import { ICorreoConsulta } from './ICorreoConsulta';
import { Predicado } from './IPredicado';

export interface IEstadisticasCorreos {
  asuntosDe(tipo: TipoBandeja): string[];
  correosQueCumplen(tipo: TipoBandeja, condicion: Predicado): ICorreoConsulta[];
  cantidadPorBandeja(): Map<TipoBandeja, number>;
  contarNoLeidos(tipo: TipoBandeja): number;
  contarFavoritos(): number;
  correosPorRemitente(tipo: TipoBandeja): Map<string, number>;
  totalDestinatarios(tipo: TipoBandeja): number;
  promedioDestinatarios(tipo: TipoBandeja): number;
}