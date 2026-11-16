import { TipoBandeja } from '../TipoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IFiltro } from '../Interfaces/IFiltro';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { IGestorFiltros } from '../Interfaces/IGestorFiltros';
import { Validar } from '../Validar';

const MAXIMO_FILTROS = 5;

// RF-05: registra hasta 5 filtros y los aplica sobre cualquier bandeja o colección
export class GestorFiltros implements IGestorFiltros {
  private _filtros: Map<string, IFiltro> = new Map();
  private _fuente: IFuenteCorreos;

  // inversión de dependencias: solo necesita poder LEER correos
  constructor(fuente: IFuenteCorreos) {
    this._fuente = fuente;
  }

  public registrar(filtro: IFiltro): void {
    Validar(this.cantidad() < MAXIMO_FILTROS, `No se pueden registrar más de ${MAXIMO_FILTROS} filtros`);
    Validar(!this.getFiltros().has(filtro.getNombre()), `Ya existe un filtro llamado ${filtro.getNombre()}`);
    this.getFiltros().set(filtro.getNombre(), filtro);
  }

  public obtener(nombre: string): IFiltro {
    Validar(this.getFiltros().has(nombre), `No existe un filtro llamado ${nombre}`);
    return this.getFiltros().get(nombre) as IFiltro;
  }

  public eliminar(nombre: string): boolean {
    return this.getFiltros().delete(nombre);
  }

  public listar(): IFiltro[] {
    const filtros: IFiltro[] = [];
    this.getFiltros().forEach((filtro) => filtros.push(filtro));
    return filtros;
  }

  public cantidad(): number {
    return this.getFiltros().size;
  }

  // el mismo filtro sirve para cualquier colección (por ejemplo, la vista de favoritos)
  public aplicar(nombre: string, correos: ICorreoConsulta[]): ICorreoConsulta[] {
    return this.obtener(nombre).aplicar(correos);
  }

  public aplicarEn(nombre: string, tipo: TipoBandeja): ICorreoConsulta[] {
    return this.aplicar(nombre, this.getFuente().listarDe(tipo));
  }

  public aplicarEnActivos(nombre: string): ICorreoConsulta[] {
    return this.aplicar(nombre, this.getFuente().listarActivos());
  }

  private getFiltros(): Map<string, IFiltro> {
    return this._filtros;
  }

  private getFuente(): IFuenteCorreos {
    return this._fuente;
  }
}