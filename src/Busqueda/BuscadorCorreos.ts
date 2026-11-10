import { TipoBandeja } from '../TipoBandeja';
import { IBuscadorCorreos } from '../Interfaces/IBuscadorCorreos';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { ICriterioBusqueda } from '../Interfaces/ICriterioBusqueda';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { Validar } from '../Validar';

// RF-04: búsqueda de correos por asunto, cuerpo, remitente y destinatarios
export class BuscadorCorreos implements IBuscadorCorreos {
  private _fuente: IFuenteCorreos;
  private _criterios: ICriterioBusqueda[] = [];

  // inversión de dependencias: recibe la fuente y los criterios
  constructor(fuente: IFuenteCorreos, criterios: ICriterioBusqueda[]) {
    Validar(criterios.length > 0, 'El buscador necesita al menos un criterio');
    this._fuente = fuente;
    this._criterios = criterios;
  }

  // RF-04: la búsqueda principal es sobre la Bandeja de Entrada
  public buscar(texto: string): ICorreoConsulta[] {
    return this.buscarEn(TipoBandeja.ENTRADA, texto);
  }

  public buscarEn(tipo: TipoBandeja, texto: string): ICorreoConsulta[] {
    return this.filtrar(this.getFuente().listarDe(tipo), texto, this.getCriterios());
  }

  // extra: busca en Entrada, Enviados y Borradores (no en Eliminados)
  public buscarEnActivas(texto: string): ICorreoConsulta[] {
    return this.filtrar(this.getFuente().listarActivos(), texto, this.getCriterios());
  }

  public buscarCon(criterio: ICriterioBusqueda, texto: string): ICorreoConsulta[] {
    return this.filtrar(this.getFuente().listarActivos(), texto, [criterio]);
  }

  // un correo entra una sola vez aunque coincida en varios campos
  private filtrar(correos: ICorreoConsulta[], texto: string, criterios: ICriterioBusqueda[]): ICorreoConsulta[] {
    Validar(texto.trim() !== '', 'El texto a buscar no puede estar vacío');
    return correos.filter((correo) => criterios.filter((criterio) => criterio.coincide(correo, texto)).length > 0);
  }

  private getFuente(): IFuenteCorreos {
    return this._fuente;
  }

  // copia: nadie de afuera cambia la lista interna
  private getCriterios(): ICriterioBusqueda[] {
    return [...this._criterios];
  }
}