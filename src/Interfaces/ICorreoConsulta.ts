import { DatosCorreo } from './IDatosCorreo';
import { IContactoConsulta } from './IContactoConsulta';

export interface ICorreoConsulta {
  getId(): string;
  getRemitente(): IContactoConsulta;
  getDestinatarios(): IContactoConsulta[];
  getEmailRemitente(): string;
  getEmailsDestinatarios(): string[];
  getAsunto(): string;
  getCuerpo(): string;
  getFecha(): Date;
  estaCompleto(): boolean;
  estaLeido(): boolean;
  esFavorito(): boolean;
  obtenerDatos(): DatosCorreo;
}