import { BandejaBase } from './BandejaBase';
import { TipoBandeja } from '../tipobandeja';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// herencia + polimorfismo: redefine las tres reglas de la base
export class BandejaEliminados extends BandejaBase {
  public override getTipo(): TipoBandeja {
    return TipoBandeja.ELIMINADOS;
  }

  // solo recibe correos que ya estaban en otra bandeja
  protected override puedeRecibirDesde(origen: TipoBandeja | null): boolean {
    return origen !== null && origen !== TipoBandeja.ELIMINADOS;
  }

  protected override admite(_correo: ICorreoConsulta): boolean {
    return true;
  }

  protected override alRecibir(correo: ICorreoBandeja, origen: TipoBandeja | null): void {
    correo.marcarEliminado(origen as TipoBandeja);
  }
}