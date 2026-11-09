import { ICorreoConsulta } from './ICorreoConsulta';
export interface IGestorFavoritos {
marcar(idCorreo: string): void;
quitar(idCorreo: string): void;
vista(): ICorreoConsulta[];
}