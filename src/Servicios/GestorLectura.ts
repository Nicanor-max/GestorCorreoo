import { TipoBandeja } from '../Bandejas/TipoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IGestorBandejas } from '../Interfaces/IGestorBandejas';
import { IGestorLectura } from '../Interfaces/IGestorLectura';

export class GestorLectura implements IGestorLectura {
 private _gestor: IGestorBandejas;
 constructor(gestor: IGestorBandejas) {
 this._gestor = gestor;
 }
 public marcarLeido(idCorreo: string): void {
 this.getGestor().obtenerCorreo(idCorreo).marcarLeido();
 }
 public marcarNoLeido(idCorreo: string): void {
 this.getGestor().obtenerCorreo(idCorreo).marcarNoLeido();
 }
 public listarNoLeidos(tipo: TipoBandeja): ICorreoConsulta[] {
 return this.getGestor().consultar(tipo).listar().filter((correo) => !correo.estaLeido());
 }

 public contarNoLeidos(tipo: TipoBandeja): number {
 return this.getGestor().consultar(tipo).listar()
 .reduce((total, correo) => (correo.estaLeido() ? total : total + 1), 0);
 }
 private getGestor(): IGestorBandejas {
 return this._gestor;
 }
}