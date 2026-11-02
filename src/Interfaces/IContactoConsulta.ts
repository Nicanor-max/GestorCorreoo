import { DatosContacto } from './IDatosContacto';

export interface IContactoConsulta {
  getNombre(): string;
  getEmail(): string;
  obtenerDatos(): DatosContacto;
}