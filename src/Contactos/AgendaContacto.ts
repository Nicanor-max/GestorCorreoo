import { Contacto } from './Contacto';
import { DireccionEmail } from '../Comun/DirreccionEmail';
import { IAgendaConsulta } from '../Interfaces/IAgendaConsulta';
import { IAgendaModificacion } from '../Interfaces/IAgendaModificacion';
import { IContactoConsulta } from '../Interfaces/IContactoConsulta';
import { validar } from '../validar';

export class AgendaContactos implements IAgendaConsulta, IAgendaModificacion {
  private _contactos: Contacto[] = [];

  public registrar(nombre: string, email: string): IContactoConsulta {
    const contacto = new Contacto(nombre, email);
    validar(!this.existe(contacto.getEmail()), `Ya existe un contacto con el email ${contacto.getEmail()}`);
    this._contactos.push(contacto);
    return contacto;
  }

  public buscarPorEmail(email: string): IContactoConsulta | null {
    const contacto = this.buscar(email);
    return contacto === undefined ? null : contacto;
  }

  // doble encapsulamiento: se devuelve una copia, nadie toca la lista interna
  public listar(): IContactoConsulta[] {
    return [...this._contactos];
  }

  public cantidad(): number {
    return this._contactos.length;
  }

  public modificarNombre(email: string, nuevoNombre: string): void {
    this.obtener(email).cambiarNombre(nuevoNombre);
  }

  public modificarEmail(emailActual: string, emailNuevo: string): void {
    const contacto = this.obtener(emailActual);
    const nuevo = new DireccionEmail(emailNuevo).getValor();
    const quedaUnico = nuevo === contacto.getEmail() || !this.existe(nuevo);
    validar(quedaUnico, `Ya existe un contacto con el email ${nuevo}`);
    contacto.cambiarEmail(nuevo);
  }

  public eliminar(email: string): boolean {
    const contacto = this.buscar(email);
    this._contactos = this._contactos.filter((c) => c !== contacto);
    return contacto !== undefined;
  }

  private buscar(email: string): Contacto | undefined {
    const normalizado = DireccionEmail.normalizar(email);
    return this._contactos.filter((c) => c.getEmail() === normalizado)[0];
  }

  private obtener(email: string): Contacto {
    const contacto = this.buscar(email);
    validar(contacto !== undefined, `No existe un contacto con el email ${email}`);
    return contacto as Contacto;
  }

  private existe(email: string): boolean {
    return this.buscar(email) !== undefined;
  }
}