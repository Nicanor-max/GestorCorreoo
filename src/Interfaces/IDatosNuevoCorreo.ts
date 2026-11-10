import { IContactoConsulta } from './IContactoConsulta';

// RF-01: remitente y destinatarios son objetos Contacto
export interface DatosNuevoCorreo {
  remitente: IContactoConsulta;
  destinatarios?: IContactoConsulta[];
  asunto?: string;
  cuerpo?: string;
  fecha?: Date;
}