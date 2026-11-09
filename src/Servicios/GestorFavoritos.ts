import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { IGestorBandejas } from '../Interfaces/IGestorBandeja';
import { IGestorFavoritos } from '../Interfaces/IGestorFavoritos';

// RF-09: favoritos como vista especial, sin mover correos de bandeja
export class GestorFavoritos implements IGestorFavoritos {
  private _gestor: IGestorBandejas;
  private _fuente: IFuenteCorreos;

  // segregación de interfaces: para marcar usa el gestor, para la vista solo la fuente de lectura
  constructor(gestor: IGestorBandejas, fuente: IFuenteCorreos) {
    this._gestor = gestor;
    this._fuente = fuente;
  }

  public marcar(idCorreo: string): void {
    this.getGestor().obtenerCorreo(idCorreo).marcarFavorito();
  }

  public quitar(idCorreo: string): void {
    this.getGestor().obtenerCorreo(idCorreo).quitarFavorito();
  }

  // cada correo vive en una sola bandeja, así que la vista no repite correos
  public vista(): ICorreoConsulta[] {
    return this.getFuente().listarActivos().filter((correo) => correo.esFavorito());
  }

  private getGestor(): IGestorBandejas {
    return this._gestor;
  }

  private getFuente(): IFuenteCorreos {
    return this._fuente;
  }
}