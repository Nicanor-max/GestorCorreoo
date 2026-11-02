import { ICorreoConsulta } from './ICorreoConsulta';
import { ICorreoEliminable } from './ICorreoEliminable';

// Lo que una bandeja necesita de un correo: consultarlo y poder eliminarlo/restaurarlo
export interface ICorreoBandeja extends ICorreoConsulta, ICorreoEliminable {}