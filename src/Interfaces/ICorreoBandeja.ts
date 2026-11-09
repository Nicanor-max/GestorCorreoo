import { ICorreoConsulta } from './ICorreoConsulta';
import { ICorreoEliminable } from './ICorreoEliminable';
import { ICorreoEstado } from './ICorreoEstado';

// Todo lo que el gestor puede hacer con un correo guardado en una bandeja
export interface ICorreoBandeja extends ICorreoConsulta, ICorreoEliminable, ICorreoEstado {}