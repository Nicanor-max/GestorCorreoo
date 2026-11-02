import { IContactoConsulta } from './IContactoConsulta';

export interface IAgendaModificacion {
  registrar(nombre: string, email: string): IContactoConsulta;
  modificarNombre(email: string, nuevoNombre: string): void;
  modificarEmail(emailActual: string, emailNuevo: string): void;
  eliminar(email: string): boolean;
}