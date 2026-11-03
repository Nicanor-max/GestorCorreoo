import { Contacto } from "./Contacto";

export class AgendaContactos {
  private readonly contactos: Map<string, Contacto> = new Map();

  agregar(contacto: Contacto): void {
    const clave = AgendaContactos.clave(contacto.email);

    if (this.contactos.has(clave)) {
      throw new Error(`Ya existe un contacto con la dirección '${contacto.email}'`);
    }

    this.contactos.set(clave, contacto);
  }

  consultar(email: string): Contacto | undefined {
    return this.contactos.get(AgendaContactos.clave(email));
  }

  modificar(emailActual: string, contactoNuevo: Contacto): void {
    const claveActual = AgendaContactos.clave(emailActual);
    const claveNueva = AgendaContactos.clave(contactoNuevo.email);

    if (!this.contactos.has(claveActual)) {
      throw new Error(`No existe un contacto con la dirección '${emailActual}'`);
    }

    if (claveNueva !== claveActual && this.contactos.has(claveNueva)) {
      throw new Error(`Ya existe un contacto con la dirección '${contactoNuevo.email}'`);
    }

    this.contactos.delete(claveActual);
    this.contactos.set(claveNueva, contactoNuevo);
  }

  eliminar(email: string): void {
    const clave = AgendaContactos.clave(email);

    if (!this.contactos.has(clave)) {
      throw new Error(`No existe un contacto con la dirección '${email}'`);
    }

    this.contactos.delete(clave);
  }

  listar(): ReadonlyArray<Contacto> {
    return Array.from(this.contactos.values());
  }

  private static clave(email: string): string {
    return email.trim().toLowerCase();
  }
}