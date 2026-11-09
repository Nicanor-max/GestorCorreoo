import { TipoBandeja } from '../TipoBandeja';

export interface ICorreoEliminable {
  estaEliminado(): boolean;
  getBandejaOrigen(): TipoBandeja | null;
  marcarEliminado(origen: TipoBandeja): void;
  restaurar(destino: TipoBandeja): void;
}