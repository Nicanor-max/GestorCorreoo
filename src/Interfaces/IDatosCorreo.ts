import { TipoBandeja } from '../TipoBandeja';
import { DatosContacto } from './IDatosContacto';

export interface DatosCorreo {
  id: string;
  remitente: DatosContacto;
  destinatarios: DatosContacto[];
  asunto: string;
  cuerpo: string;
  fecha: Date;
  leido: boolean;
  favorito: boolean;
  eliminado: boolean;
  bandejaOrigen: TipoBandeja | null;
}