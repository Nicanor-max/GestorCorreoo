import { TipoBandeja } from '../TipoBandeja';

export interface DatosCorreo {
  id: string;
  remitente: string;
  destinatarios: string[];
  asunto: string;
  cuerpo: string;
  fecha: Date;
  leido: boolean;
  favorito: boolean;
  eliminado: boolean;
  bandejaOrigen: TipoBandeja | null;
}