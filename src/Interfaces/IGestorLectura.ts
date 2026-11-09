import { TipoBandeja } from '../TipoBandeja';
import { ICorreoConsulta } from './ICorreoConsulta';
export interface IGestorLectura {
 marcarLeido(idCorreo: string): void;
 marcarNoLeido(idCorreo: string): void;
 listarNoLeidos(tipo: TipoBandeja): ICorreoConsulta[];
 contarNoLeidos(tipo: TipoBandeja): number;
}