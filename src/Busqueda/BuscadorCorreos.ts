import { TipoBandeja } from '../TipoBandeja';
import { IBuscadorCorreos } from '../Interfaces/IBuscadorCorreos';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { ICriterioBusqueda } from '../Interfaces/ICriterioBusqueda';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { Validar } from '../Validar';

export class BuscadorCorreos implements IBuscadorCorreos {
 private _fuente: IFuenteCorreos;
 private _criterios: ICriterioBusqueda[] = [];

 constructor(fuente: IFuenteCorreos, criterios: ICriterioBusqueda[]) {
 Validar(criterios.length > 0, 'El buscador necesita al menos un criterio');
 this._fuente = fuente;
 this._criterios = criterios;
 }

 public buscar(texto: string): ICorreoConsulta[] {
 return this.filtrar(this.getFuente().listarActivos(), texto, this.getCriterios());
 }
 public buscarEn(tipo: TipoBandeja, texto: string): ICorreoConsulta[] {
 return this.filtrar(this.getFuente().listarDe(tipo), texto, this.getCriterios());
 }
 public buscarCon(criterio: ICriterioBusqueda, texto: string): ICorreoConsulta[] {
 return this.filtrar(this.getFuente().listarActivos(), texto, [criterio]);
 }

 private filtrar(correos: ICorreoConsulta[], texto: string, criterios: ICriterioBusqueda[]):
 ICorreoConsulta[] {
 Validar(texto.trim() !== '', 'El texto a buscar no puede estar vacío');
 return correos.filter((correo) => criterios.filter((criterio) => criterio.coincide(correo, texto)).
 length > 0);
 }
 private getFuente(): IFuenteCorreos {
 return this._fuente;
 }

 private getCriterios(): ICriterioBusqueda[] {
 return [...this._criterios];
 }
}