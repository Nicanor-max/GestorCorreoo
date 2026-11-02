import { DatosCorreo } from './IDatosCorreo'    ;

export interface ICorreoConsulta {
  getId(): string;
  getRemitente(): string;
  getDestinatarios(): string[];
  getAsunto(): string;
  getCuerpo(): string;
  getFecha(): Date;
  estaCompleto(): boolean;
  obtenerDatos(): DatosCorreo;
}