import { Contacto } from "./Contacto";

export class AgendaContactos {
  private readonly contactos: Map<string, Contacto> = new Map();

  agregar(contacto: Contacto): void {
    this.contactos.set(AgendaContactos.clave(contacto.email), contacto);
  }

  consultar(email: string): Contacto | undefined {
    return this.contactos.get(AgendaContactos.clave(email));
  }

  modificar(emailActual: string, contactoNuevo: Contacto): void {
    const claveActual = AgendaContactos.clave(emailActual);

    if (!this.contactos.has(claveActual)) {
      throw new Error(`No existe un contacto con la dirección '${emailActual}'`);
    }

    this.contactos.delete(claveActual);
    this.contactos.set(AgendaContactos.clave(contactoNuevo.email), contactoNuevo);
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