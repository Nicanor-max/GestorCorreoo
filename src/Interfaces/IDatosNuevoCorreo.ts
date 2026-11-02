export interface DatosNuevoCorreo {
  remitente: string;
  destinatarios?: string[];
  asunto?: string;
  cuerpo?: string;
  fecha?: Date;
}