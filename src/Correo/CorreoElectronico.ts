import { DireccionEmail } from '../Comun/DirreccionEmail';
import { TipoBandeja } from '../tipobandeja';
import { DatosCorreo } from '../Interfaces/IDatosCorreo';
import { DatosNuevoCorreo } from '../Interfaces/IDatosNuevoCorreo';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { validar } from '../validar';

export class CorreoElectronico implements ICorreoBandeja {

  // encapsulamiento: los atributos son privados
  private _id: string = '';
  private _remitente: DireccionEmail = new DireccionEmail('sin-remitente@correo.com');
  private _destinatarios: DireccionEmail[] = [];
  private _asunto: string = '';
  private _cuerpo: string = '';
  private _fecha: Date = new Date();
  private _bandejaOrigen: TipoBandeja | null = null;
  private _leido: boolean = false;
  private _favorito: boolean = false;

  // doble encapsulamiento: ni siquiera la propia clase toca los atributos directo,
  // todo pasa por los set (que validan) y los get
  constructor(id: string, datos: DatosNuevoCorreo) {
    this.setId(id);
    this.setRemitente(datos.remitente);
    // si un dato opcional no viene, se usa un valor por defecto
    this.setDestinatarios(datos.destinatarios === undefined ? [] : datos.destinatarios);
    this.setAsunto(datos.asunto === undefined ? '' : datos.asunto);
    this.setCuerpo(datos.cuerpo === undefined ? '' : datos.cuerpo);
    this.setFecha(datos.fecha === undefined ? new Date() : datos.fecha);
  }

  // ---------- get públicos ----------

  public getId(): string {
    return this._id;
  }

  public getRemitente(): string {
    return this._remitente.getValor();
  }

  // devuelve una copia, no la lista interna
  public getDestinatarios(): string[] {
    return this._destinatarios.map((d) => d.getValor());
  }

  public getAsunto(): string {
    return this._asunto;
  }

  public getCuerpo(): string {
    return this._cuerpo;
  }

  // devuelve una copia, no la fecha interna
  public getFecha(): Date {
    return new Date(this._fecha.getTime());
  }

  public getBandejaOrigen(): TipoBandeja | null {
    return this._bandejaOrigen;
  }

  public estaLeido(): boolean {
    return this._leido;
  }

  public esFavorito(): boolean {
    return this._favorito;
  }

  // ---------- comportamiento ----------

  public estaCompleto(): boolean {
    return this.getDestinatarios().length > 0 && this.getAsunto() !== '';
  }

  public estaEliminado(): boolean {
    return this.getBandejaOrigen() !== null;
  }

  // eliminación lógica: el correo no se borra, se recuerda de dónde vino
  public marcarEliminado(origen: TipoBandeja): void {
    validar(!this.estaEliminado(), `El correo ${this.getId()} ya está eliminado`);
    validar(origen !== TipoBandeja.ELIMINADOS, 'El origen de un correo eliminado no puede ser Eliminados');
    this.setBandejaOrigen(origen);
  }

  public restaurar(destino: TipoBandeja): void {
    validar(this.estaEliminado(), `El correo ${this.getId()} no está eliminado`);
    validar(destino === this.getBandejaOrigen(), `El correo ${this.getId()} solo puede volver a ${this.getBandejaOrigen()}`);
    this.setBandejaOrigen(null);
  }

  // RF-08: estados de lectura
  public marcarLeido(): void {
    this.setLeido(true);
  }

  public marcarNoLeido(): void {
    this.setLeido(false);
  }

  // RF-09: favoritos
  public marcarFavorito(): void {
    this.setFavorito(true);
  }

  public quitarFavorito(): void {
    this.setFavorito(false);
  }

  public obtenerDatos(): DatosCorreo {
    return {
      id: this.getId(),
      remitente: this.getRemitente(),
      destinatarios: this.getDestinatarios(),
      asunto: this.getAsunto(),
      cuerpo: this.getCuerpo(),
      fecha: this.getFecha(),
      leido: this.estaLeido(),
      favorito: this.esFavorito(),
      eliminado: this.estaEliminado(),
      bandejaOrigen: this.getBandejaOrigen(),
    };
  }

  // ---------- set privados (validan antes de guardar) ----------

  private setId(valor: string): void {
    validar(valor.trim() !== '', 'El id del correo no puede estar vacío');
    this._id = valor.trim();
  }

  private setRemitente(valor: string): void {
    this._remitente = new DireccionEmail(valor);
  }

  private setDestinatarios(valores: string[]): void {
    const direcciones = valores.map((v) => new DireccionEmail(v));
    const emails = direcciones.map((d) => d.getValor());
    const repetidos = emails.filter((email) => emails.filter((otro) => otro === email).length > 1);
    validar(repetidos.length === 0, 'Hay destinatarios repetidos');
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

  private setBandejaOrigen(valor: TipoBandeja | null): void {
    this._bandejaOrigen = valor;
  }

  private setLeido(valor: boolean): void {
    this._leido = valor;
  }

  private setFavorito(valor: boolean): void {
    this._favorito = valor;
  }
}