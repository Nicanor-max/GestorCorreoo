import { DatosEdicionCorreo } from './IDatosEdicionCorreo';
import { IUsuario } from './IUsuarios';

// El servidor conoce a todos los usuarios y reparte los correos entre sus buzones
export interface IServidorCorreo {
  registrar(usuario: IUsuario): void;
  existe(email: string): boolean;
  obtenerUsuario(email: string): IUsuario;
  redactar(emailRemitente: string, datos: DatosEdicionCorreo): string;
  enviarBorrador(emailRemitente: string, idBorrador: string): string[];
  enviar(emailRemitente: string, datos: DatosEdicionCorreo): string;
  enviarAContactos(emailRemitente: string, emailsContactos: string[], asunto: string, cuerpo: string): string;
}