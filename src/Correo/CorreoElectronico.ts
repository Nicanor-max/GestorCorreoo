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

  public estaEliminado(): boolean {
    return this._bandejaOrigen !== null;
  }

  public getBandejaOrigen(): TipoBandeja | null {
    return this._bandejaOrigen;
  }

  // eliminación lógica: el correo no se borra, se recuerda de dónde vino
  public marcarEliminado(origen: TipoBandeja): void {
    validar(!this.estaEliminado(), `El correo ${this._id} ya está eliminado`);
    validar(origen !== TipoBandeja.ELIMINADOS, 'El origen de un correo eliminado no puede ser Eliminados');
    this._bandejaOrigen = origen;
  }

  public restaurar(destino: TipoBandeja): void {
    validar(this.estaEliminado(), `El correo ${this._id} no está eliminado`);
    validar(destino === this._bandejaOrigen, `El correo ${this._id} solo puede volver a ${this._bandejaOrigen}`);
    this._bandejaOrigen = null;
  }

  public obtenerDatos(): DatosCorreo {
    return {
      id: this._id,
      remitente: this.getRemitente(),
      destinatarios: this.getDestinatarios(),
      asunto: this._asunto,
      cuerpo: this._cuerpo,
      fecha: this.getFecha(),
      eliminado: this.estaEliminado(),
      bandejaOrigen: this._bandejaOrigen,
    };
  }

  private setId(valor: string): void {
    validar(valor.trim() !== '', 'El id del correo no puede estar vacío');
    this._id = valor.trim();
  }

  private setDestinatarios(valores: string[]): void {
    const direcciones = valores.map((v) => new DireccionEmail(v));
    const unicas = new Set(direcciones.map((d) => d.getValor()));
    validar(unicas.size === direcciones.length, 'Hay destinatarios repetidos');
    this._destinatarios = direcciones;
  }

  private setAsunto(valor: string): void {
    this._asunto = valor.trim();
  }

  private setCuerpo(valor: string): void {
    this._cuerpo = valor;
  }

  private setFecha(valor: Date): void {
    validar(!Number.isNaN(valor.getTime()), 'La fecha del correo no es válida');
    this._fecha = new Date(valor.getTime());
  }
}