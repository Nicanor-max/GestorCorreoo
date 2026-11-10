import { ICorreoConsulta } from './ICorreoConsulta';
export interface ICriterioBusqueda {
 coincide(correo: ICorreoConsulta, texto: string): boolean;
}
