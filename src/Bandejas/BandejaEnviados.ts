import { BandejaBase } from './BandejaBase';
import { TipoBandeja } from '../TipoBandeja';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';

// herencia + polimorfismo: además de las reglas de la base,
// recibe los borradores que se envían (RF-02)
export class BandejaEnviados extends BandejaBase {
  public override getTipo(): TipoBandeja {
    return TipoBandeja.ENVIADOS;
  }

  protected override puedeRecibirDesde(origen: TipoBandeja | null): boolean {
    return super.puedeRecibirDesde(origen) || origen === TipoBandeja.BORRADORES;
  }

  // un correo que yo envié ya está leído
  protected override alRecibir(correo: ICorreoBandeja, origen: TipoBandeja | null): void {
    super.alRecibir(correo, origen);
    correo.marcarLeido();
  }
}