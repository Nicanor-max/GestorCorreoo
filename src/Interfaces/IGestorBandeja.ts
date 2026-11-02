import { TipoBandeja } from '../tipobandeja';
import { IBandejaConsulta } from './IBandejaConsulta';
import { ICorreoBandeja } from './ICorreoBandeja';

export interface IGestorBandejas {
  agregar(correo: ICorreoBandeja, destino: TipoBandeja): void;
  mover(idCorreo: string, destino: TipoBandeja): void;
  eliminar(idCorreo: string): void;
  restaurar(idCorreo: string): void;
  consultar(tipo: TipoBandeja): IBandejaConsulta;
  ubicacionDe(idCorreo: string): TipoBandeja | null;
}