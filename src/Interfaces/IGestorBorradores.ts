import { DatosEdicionCorreo } from './IDatosEdicionCorreo';
import { ICorreoBandeja } from './ICorreoBandeja';
import { ICorreoConsulta } from './ICorreoConsulta';

export interface IGestorBorradores {
  guardar(correo: ICorreoBandeja): void;
  editar(idBorrador: string, cambios: DatosEdicionCorreo): void;
  recuperar(idBorrador: string): ICorreoConsulta;
  listar(): ICorreoConsulta[];
}