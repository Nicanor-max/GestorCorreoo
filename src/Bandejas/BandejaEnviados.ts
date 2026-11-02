import { BandejaBase } from './BandejaBase';
import { TipoBandeja } from '../tipobandeja';

// herencia
export class BandejaEnviados extends BandejaBase {
  public override getTipo(): TipoBandeja {
    return TipoBandeja.ENVIADOS;
  }
}