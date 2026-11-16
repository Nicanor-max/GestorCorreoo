import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IFiltro } from '../Interfaces/IFiltro';
import { Predicado } from '../Interfaces/IPredicado';
import { Validar } from '../Validar';

// RF-05: un filtro tiene un nombre y un predicado.
// NO guarda correos: los evalúa cada vez que se aplica, por eso siempre refleja el estado actual.
export class FiltroPersonalizado implements IFiltro {
  private _nombre: string = '';
  private _predicado: Predicado;

  constructor(nombre: string, predicado: Predicado) {
    this.setNombre(nombre);
    this._predicado = predicado;
  }

  public getNombre(): string {
    return this._nombre;
  }

  // se puede reutilizar el predicado para armar filtros nuevos
  public getPredicado(): Predicado {
    return this._predicado;
  }

  public cumple(correo: ICorreoConsulta): boolean {
    return this.getPredicado()(correo);
  }

  // filter devuelve una lista nueva: la colección original no se toca
  public aplicar(correos: ICorreoConsulta[]): ICorreoConsulta[] {
    return correos.filter((correo) => this.cumple(correo));
  }

  private setNombre(valor: string): void {
    Validar(valor.trim() !== '', 'El filtro necesita un nombre');
    this._nombre = valor.trim();
  }
}