import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { Predicado } from '../Interfaces/IPredicado';

// RF-05: programación funcional.
// Cada función de acá DEVUELVE una función (lambda): son funciones de orden superior.
// Ninguna modifica el correo: solo lo consultan.

const contiene = (texto: string, buscado: string): boolean =>
  texto.toLowerCase().includes(buscado.toLowerCase());

// ---------- predicados simples (un solo campo) ----------

export const remitenteDelDominio = (dominio: string): Predicado =>
  (correo: ICorreoConsulta) => correo.getEmailRemitente().endsWith(dominio.toLowerCase());

export const remitenteEs = (email: string): Predicado =>
  (correo: ICorreoConsulta) => correo.getEmailRemitente() === email.toLowerCase();

export const asuntoContiene = (texto: string): Predicado =>
  (correo: ICorreoConsulta) => contiene(correo.getAsunto(), texto);

export const cuerpoContiene = (texto: string): Predicado =>
  (correo: ICorreoConsulta) => contiene(correo.getCuerpo(), texto);

export const esLeido = (): Predicado =>
  (correo: ICorreoConsulta) => correo.estaLeido();

export const esFavorito = (): Predicado =>
  (correo: ICorreoConsulta) => correo.esFavorito();

// ---------- operadores lógicos (combinan predicados) ----------

// AND: cumple si cumple TODOS (reduce arranca en true)
export const y = (predicados: Predicado[]): Predicado =>
  (correo: ICorreoConsulta) => predicados.reduce((cumple, p) => cumple && p(correo), true);

// OR: cumple si cumple ALGUNO (reduce arranca en false)
export const o = (predicados: Predicado[]): Predicado =>
  (correo: ICorreoConsulta) => predicados.reduce((cumple, p) => cumple || p(correo), false);

// NOT: invierte el resultado
export const no = (predicado: Predicado): Predicado =>
  (correo: ICorreoConsulta) => !predicado(correo);