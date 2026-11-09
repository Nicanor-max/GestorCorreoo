import { BandejaBase } from './BandejaBase';
import { TipoBandeja } from '../TipoBandeja';

// herencia
export class BandejaEnviados extends BandejaBase {
  public override getTipo(): TipoBandeja {
    return TipoBandeja.ENVIADOS;
  }
}