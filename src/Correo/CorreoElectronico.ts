import { DireccionEmail } from '../Comun/DirreccionEmail';
import { TipoBandeja } from '../tipobandeja';
import { DatosCorreo } from '../Interfaces/IDatosCorreo';
import { DatosNuevoCorreo } from '../Interfaces/IDatosNuevoCorreo';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { validar } from '../validar';

export class CorreoElectronico implements ICorreoBandeja {

  // encapsulamiento
  private _id: string = '';
  private _remitente: DireccionEmail;
  private _destinatarios: DireccionEmail[] = [];
  private _asunto: string = '';
  private _cuerpo: string = '';
  private _fecha: Date = new Date();
  private _bandejaOrigen: TipoBandeja | null = null;

  constructor(id: string, datos: DatosNuevoCorreo) {
    this.setId(id);
    this._remitente = new DireccionEmail(datos.remitente);
    this.setDestinatarios(datos.destinatarios ?? []);
    this.setAsunto(datos.asunto ?? '');
    this.setCuerpo(datos.cuerpo ?? '');
    this.setFecha(datos.fecha ?? new Date());
  }

  public getId(): string {
    return this._id;
  }

  public getRemitente(): string {
    return this._remitente.getValor();
  }

  // doble encapsulamiento: devuelve copias, no las referencias internas
  public getDestinatarios(): string[] {
    return this._destinatarios.map((d) => d.getValor());
  }

  public getAsunto(): string {
    return this._asunto;
  }

  public getCuerpo(): string {
    return this._cuerpo;
  }

  public getFecha(): Date {
    return new Date(this._fecha.getTime());
  }

  public estaCompleto(): boolean {
    return this._destinatarios.length > 0 && this._asunto !== '';
  }


}