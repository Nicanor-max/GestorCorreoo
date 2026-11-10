import { Contacto } from '../Contactos/Contacto';

// arma un Contacto rápido para los tests: el nombre es lo que está antes de la @
export const contacto = (email: string, nombre?: string): Contacto =>
  new Contacto(nombre === undefined ? email.split('@')[0] : nombre, email);