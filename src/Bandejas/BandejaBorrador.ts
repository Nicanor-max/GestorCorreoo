import { BandejaBase } from './BandejaBase';
import { TipoBandeja } from '../tipobandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// herencia + polimorfismo: un borrador puede estar incompleto
export class BandejaBorradores extends BandejaBase {
  public override getTipo(): TipoBandeja {
    return TipoBandeja.BORRADORES;
  }

  protected override admite(_correo: ICorreoConsulta): boolean {
    return true;
  }
}