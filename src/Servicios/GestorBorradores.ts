import { TipoBandeja } from '../TipoBandeja';
import { DatosEdicionCorreo } from '../Interfaces/IDatosEdicionCorreo';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IGestorBandejas } from '../Interfaces/IGestorBandeja';
import { IGestorBorradores } from '../Interfaces/IGestorBorradores';
import { Validar } from '../Validar';

// RF-07: borradores que se pueden guardar incompletos, editar y recuperar
export class GestorBorradores implements IGestorBorradores {
  private _gestor: IGestorBandejas;

  constructor(gestor: IGestorBandejas) {
    this._gestor = gestor;
  }

  public guardar(correo: ICorreoBandeja): void {
    this.getGestor().agregar(correo, TipoBandeja.BORRADORES);
  }

  // solo cambia lo que viene en "cambios"; el resto queda igual
  public editar(idBorrador: string, cambios: DatosEdicionCorreo): void {
    const borrador = this.obtenerBorrador(idBorrador);
    if (cambios.destinatarios !== undefined) {
      borrador.cambiarDestinatarios(cambios.destinatarios);
    }
    if (cambios.asunto !== undefined) {
      borrador.cambiarAsunto(cambios.asunto);
    }
    if (cambios.cuerpo !== undefined) {
      borrador.cambiarCuerpo(cambios.cuerpo);
    }
  }

  public recuperar(idBorrador: string): ICorreoConsulta {
    return this.obtenerBorrador(idBorrador);
  }

  public listar(): ICorreoConsulta[] {
    return this.getGestor().consultar(TipoBandeja.BORRADORES).listar();
  }

  private obtenerBorrador(idBorrador: string): ICorreoBandeja {
    Validar(this.getGestor().ubicacionDe(idBorrador) === TipoBandeja.BORRADORES, `El correo ${idBorrador} no es un borrador`);
    return this.getGestor().obtenerCorreo(idBorrador);
  }

  private getGestor(): IGestorBandejas {
    return this._gestor;
  }
}