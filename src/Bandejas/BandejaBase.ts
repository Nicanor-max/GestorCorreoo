import { TipoBandeja } from '../TipoBandeja';
import { IBandeja } from '../Interfaces/IBandeja';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { validar } from '../validar';

// clase abstracta: todas las bandejas heredan de acá
export abstract class BandejaBase implements IBandeja {
  private _correos: ICorreoBandeja[] = [];

  public abstract getTipo(): TipoBandeja;

  // los más recientes primero: reduce va insertando cada correo en su lugar
  // y filter separa los más nuevos de los más viejos. Devuelve una lista nueva.
  public listar(): ICorreoConsulta[] {
    return this._correos.reduce<ICorreoBandeja[]>((ordenados, correo) => [
      ...ordenados.filter((otro) => this.esMasNuevoOIgual(otro, correo)),
      correo,
      ...ordenados.filter((otro) => !this.esMasNuevoOIgual(otro, correo)),
    ], []);
  }

  public buscarPorId(id: string): ICorreoConsulta | null {
    const correo = this.buscar(id);
    return correo === undefined ? null : correo;
  }

  public contiene(id: string): boolean {
    return this.buscar(id) !== undefined;
  }

  public cantidad(): number {
    return this._correos.length;
  }

  // método plantilla: los pasos son fijos, cada bandeja redefine las reglas
  public recibir(correo: ICorreoBandeja, origen: TipoBandeja | null): void {
    validar(!this.contiene(correo.getId()), `El correo ${correo.getId()} ya está en ${this.getTipo()}`);
    const desde = origen === null ? 'NUEVO' : origen;
    validar(this.puedeRecibirDesde(origen), `No se puede mover un correo de ${desde} a ${this.getTipo()}`);
    validar(this.admite(correo), `La bandeja ${this.getTipo()} no admite el correo ${correo.getId()}`);
    this.alRecibir(correo, origen);
    this._correos.push(correo);
  }

  public obtener(id: string): ICorreoBandeja {
    const correo = this.buscar(id);
    validar(correo !== undefined, `El correo ${id} no está en ${this.getTipo()}`);
    return correo as ICorreoBandeja;
  }

  public quitar(id: string): ICorreoBandeja {
    const correo = this.obtener(id);
    this._correos = this._correos.filter((c) => c !== correo);
    return correo;
  }

  // polimorfismo: comportamiento por defecto que las hijas pueden redefinir
  protected puedeRecibirDesde(origen: TipoBandeja | null): boolean {
    return origen === null || origen === TipoBandeja.ELIMINADOS;
  }

  protected admite(correo: ICorreoConsulta): boolean {
    return correo.estaCompleto();
  }

  protected alRecibir(correo: ICorreoBandeja, origen: TipoBandeja | null): void {
    origen === TipoBandeja.ELIMINADOS && correo.restaurar(this.getTipo());
  }

  private esMasNuevoOIgual(a: ICorreoConsulta, b: ICorreoConsulta): boolean {
    return a.getFecha().getTime() >= b.getFecha().getTime();
  }

  private buscar(id: string): ICorreoBandeja | undefined {
    return this._correos.filter((c) => c.getId() === id)[0];
  }
}