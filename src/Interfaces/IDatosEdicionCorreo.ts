import { IContactoConsulta } from './IContactoConsulta';

export interface DatosEdicionCorreo {
  destinatarios?: IContactoConsulta[];
  asunto?: string;
  cuerpo?: string;
}