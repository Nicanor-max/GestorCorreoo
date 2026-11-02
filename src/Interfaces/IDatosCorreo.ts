import { TipoBandeja } from '../tipobandeja';

export interface DatosCorreo {
  id: string;
  remitente: string;
  destinatarios: string[];
  asunto: string;
  cuerpo: string;
  fecha: Date;
  eliminado: boolean;
  bandejaOrigen: TipoBandeja | null;
}