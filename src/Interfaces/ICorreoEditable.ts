import { IContactoConsulta } from './IContactoConsulta';

// RF-07: lo que se puede cambiar de un borrador
export interface ICorreoEditable {
  cambiarDestinatarios(destinatarios: IContactoConsulta[]): void;
  cambiarAsunto(asunto: string): void;
  cambiarCuerpo(cuerpo: string): void;
}