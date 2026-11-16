import { ICorreoConsulta } from './ICorreoConsulta';

// RF-05: una función predicado recibe un correo y dice si cumple (true) o no (false)
export type Predicado = (correo: ICorreoConsulta) => boolean;