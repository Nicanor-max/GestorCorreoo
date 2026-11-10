import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { ICriterioBusqueda } from '../Interfaces/ICriterioBusqueda';

export abstract class CriterioBusqueda implements ICriterioBusqueda {
 public coincide(correo: ICorreoConsulta, texto: string): boolean {
 const buscado = this.normalizar(texto);
 return this.textosDe(correo).filter((t) => this.normalizar(t).includes(buscado)).length > 0;
 }
 
 protected abstract textosDe(correo: ICorreoConsulta): string[];
 private normalizar(texto: string): string {
 return texto.trim().toLowerCase();
 }
}
