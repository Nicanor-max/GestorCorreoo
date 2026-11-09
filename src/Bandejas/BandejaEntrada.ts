import { BandejaBase } from './BandejaBase';
import { TipoBandeja } from '../TipoBandeja';
// herencia: usa las reglas por defecto (solo correos completos, nuevos o restaurados)
export class BandejaEntrada extends BandejaBase {
  public override getTipo(): TipoBandeja {
    return TipoBandeja.ENTRADA;
  }
}