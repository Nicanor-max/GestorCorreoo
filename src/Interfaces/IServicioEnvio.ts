import { ICorreoBandeja } from './ICorreoBandeja';

export interface IServicioEnvio {
  enviar(idBorrador: string): void;
  enviarNuevo(correo: ICorreoBandeja): void;
}