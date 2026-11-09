import { DireccionEmail } from '../Comun/DirreccionEmail';
import { DatosContacto } from '../Interfaces/IDatosContacto';
import { IContactoConsulta } from '../Interfaces/IContactoConsulta';
import { IContactoModificacion } from '../Interfaces/IContactoModificacion';
import { Validar } from '../Validar';

export class Contacto implements IContactoConsulta, IContactoModificacion {

  // encapsulamiento
  private _nombre: string = '';
  private _email: DireccionEmail;

  constructor(nombre: string, email: string) {
    // doble encapsulamiento: hasta el constructor pasa por los setters que validan
    this.setNombre(nombre);
    this._email = new DireccionEmail(email);
  }

  public getNombre(): string {
    return this._nombre;
  }

  public getEmail(): string {
    return this._email.getValor();
  }

  public obtenerDatos(): DatosContacto {
    return { nombre: this.getNombre(), email: this.getEmail() };
  }

  public cambiarNombre(nombre: string): void {
    this.setNombre(nombre);
  }

  public cambiarEmail(email: string): void {
    this.setEmail(email);
  }

  private setNombre(valor: string): void {
    Validar(valor.trim() !== '', 'El nombre del contacto no puede estar vacío');
    this._nombre = valor.trim();
  }

  private setEmail(valor: string): void {
    this._email = new DireccionEmail(valor);
  }
}