import { Contacto } from '../Contactos/Contacto';
import { TipoBandeja } from '../TipoBandeja';
import { DatosCorreo } from '../Interfaces/IDatosCorreo';
import { DatosNuevoCorreo } from '../Interfaces/IDatosNuevoCorreo';
import { IContactoConsulta } from '../Interfaces/IContactoConsulta';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { Validar } from '../Validar';

export class CorreoElectronico implements ICorreoBandeja {

  // encapsulamiento: los atributos son privados
  // RF-01: remitente y destinatarios son objetos Contacto
  private _id: string = '';
  private _remitente: Contacto = new Contacto('Sin remitente', 'sin-remitente@correo.com');
  private _destinatarios: Contacto[] = [];
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

  // devuelve una copia del contacto: desde afuera no se puede cambiar el remitente
  public getRemitente(): IContactoConsulta {
    return this.copiar(this._remitente);
  }

  // devuelve copias: la colección de destinatarios no se puede modificar desde afuera
  public getDestinatarios(): IContactoConsulta[] {
    return this._destinatarios.map((d) => this.copiar(d));
  }

  public getEmailRemitente(): string {
    return this.getRemitente().getEmail();
  }

  public getEmailsDestinatarios(): string[] {
    return this.getDestinatarios().map((d) => d.getEmail());
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
    Validar(!this.estaEliminado(), `El correo ${this.getId()} ya está eliminado`);
    Validar(origen !== TipoBandeja.ELIMINADOS, 'El origen de un correo eliminado no puede ser Eliminados');
    this.setBandejaOrigen(origen);
  }

  public restaurar(destino: TipoBandeja): void {
    Validar(this.estaEliminado(), `El correo ${this.getId()} no está eliminado`);
    Validar(destino === this.getBandejaOrigen(), `El correo ${this.getId()} solo puede volver a ${this.getBandejaOrigen()}`);
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

  // RF-07: edición de borradores (pasa por los mismos set que validan)
  public cambiarDestinatarios(destinatarios: IContactoConsulta[]): void {
    this.setDestinatarios(destinatarios);
  }

  public cambiarAsunto(asunto: string): void {
    this.setAsunto(asunto);
  }

  public cambiarCuerpo(cuerpo: string): void {
    this.setCuerpo(cuerpo);
  }

  public obtenerDatos(): DatosCorreo {
    return {
      id: this.getId(),
      remitente: this.getRemitente().obtenerDatos(),
      destinatarios: this.getDestinatarios().map((d) => d.obtenerDatos()),
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
    Validar(valor.trim() !== '', 'El id del correo no puede estar vacío');
    this._id = valor.trim();
  }

  // guarda una copia: si después el contacto cambia o se borra de la agenda,
  // el correo histórico conserva los datos con los que se creó
  private setRemitente(valor: IContactoConsulta): void {
    this._remitente = this.copiar(valor);
  }

  private setDestinatarios(valores: IContactoConsulta[]): void {
    const emails = valores.map((d) => d.getEmail());
    const repetidos = emails.filter((email) => emails.filter((otro) => otro === email).length > 1);
    Validar(repetidos.length === 0, 'Hay destinatarios repetidos');
    this._destinatarios = valores.map((d) => this.copiar(d));
  }

  private setAsunto(valor: string): void {
    this._asunto = valor.trim();
  }

  private setCuerpo(valor: string): void {
    this._cuerpo = valor;
  }

  private setFecha(valor: Date): void {
    Validar(!Number.isNaN(valor.getTime()), 'La fecha del correo no es válida');
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

  private copiar(contacto: IContactoConsulta): Contacto {
    return new Contacto(contacto.getNombre(), contacto.getEmail());
  }
}