export class Contacto {
  private readonly _nombre: string;
  private readonly _email: string;

  constructor(nombre: string, email: string) {
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();

    if (nombreLimpio.length === 0) {
      throw new Error("El nombre del contacto no puede estar vacío");
    }

    if (!Contacto.esEmailValido(emailLimpio)) {
      throw new Error(`La dirección de correo '${email}' no es válida`);
    }

    this._nombre = nombreLimpio;
    this._email = emailLimpio;
  }

  get nombre(): string {
    return this._nombre;
  }

  get email(): string {
    return this._email;
  }

  private static esEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}