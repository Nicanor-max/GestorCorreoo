import { TipoBandeja } from '../TipoBandeja';
import { DireccionEmail } from '../Comun/DirreccionEmail';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { DatosEdicionCorreo } from '../Interfaces/IDatosEdicionCorreo';
import { IContactoConsulta } from '../Interfaces/IContactoConsulta';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IServidorCorreo } from '../Interfaces/IServidorCorreo';
import { IUsuario } from '../Interfaces/IUsuarios';
import { Validar } from '../Validar';

// El "cartero": conoce a todos los usuarios y reparte cada correo enviado.
// El remitente lo guarda en SUS Enviados y cada destinatario recibe SU PROPIA copia en su Entrada.
export class ServidorCorreo implements IServidorCorreo {
  // cada email apunta a su usuario
  private _usuarios: Map<string, IUsuario> = new Map();
  // genera ids únicos en todo el servidor, así nunca chocan entre buzones
  private _contador: number = 0;

  public registrar(usuario: IUsuario): void {
    Validar(!this.existe(usuario.getEmail()), `Ya existe un usuario con el email ${usuario.getEmail()}`);
    this.getUsuarios().set(usuario.getEmail(), usuario);
  }

  public existe(email: string): boolean {
    return this.getUsuarios().has(DireccionEmail.normalizar(email));
  }

  public obtenerUsuario(email: string): IUsuario {
    Validar(this.existe(email), `No existe un usuario con el email ${email}`);
    return this.getUsuarios().get(DireccionEmail.normalizar(email)) as IUsuario;
  }

  // crea un borrador en los Borradores del remitente (puede estar incompleto)
  public redactar(emailRemitente: string, datos: DatosEdicionCorreo): string {
    const usuario = this.obtenerUsuario(emailRemitente);
    const correo = this.crearCorreo(usuario, datos);
    usuario.getBorradores().guardar(correo);
    return correo.getId();
  }

  // envía un borrador: sale de Borradores, va a Enviados y se reparte a los destinatarios
  public enviarBorrador(emailRemitente: string, idBorrador: string): string[] {
    const usuario = this.obtenerUsuario(emailRemitente);
    usuario.getEnvio().enviar(idBorrador);
    return this.entregar(usuario.getBandejas().obtenerCorreo(idBorrador));
  }

  // envía un correo nuevo directo: si no es válido, no queda en ningún buzón
  public enviar(emailRemitente: string, datos: DatosEdicionCorreo): string {
    const usuario = this.obtenerUsuario(emailRemitente);
    const correo = this.crearCorreo(usuario, datos);
    usuario.getEnvio().enviarNuevo(correo);
    this.entregar(correo);
    return correo.getId();
  }

  // envía a contactos de la agenda del remitente: solo puede elegir gente que tenga agendada
  public enviarAContactos(emailRemitente: string, emailsContactos: string[], asunto: string, cuerpo: string): string {
    const usuario = this.obtenerUsuario(emailRemitente);
    const destinatarios = emailsContactos.map((email) => this.contactoDeAgenda(usuario, email));
    return this.enviar(emailRemitente, { destinatarios, asunto, cuerpo });
  }

  private contactoDeAgenda(usuario: IUsuario, email: string): IContactoConsulta {
    const contacto = usuario.getAgenda().buscarPorEmail(email);
    Validar(contacto !== null, `${email} no está en la agenda de ${usuario.getEmail()}`);
    return contacto as IContactoConsulta;
  }

  // deja una copia en la Entrada de cada destinatario que tenga cuenta (y no sea el remitente)
  private entregar(correo: ICorreoConsulta): string[] {
    const receptores = correo.getEmailsDestinatarios()
      .filter((email) => this.existe(email) && email !== correo.getEmailRemitente());
    receptores.forEach((email) =>
      this.obtenerUsuario(email).getBandejas().agregar(this.copiar(correo), TipoBandeja.ENTRADA));
    return receptores;
  }

  // el remitente siempre es el usuario: nadie puede enviar a nombre de otro
  private crearCorreo(usuario: IUsuario, datos: DatosEdicionCorreo): CorreoElectronico {
    return new CorreoElectronico(this.generarId(), {
      remitente: usuario.getContacto(),
      destinatarios: datos.destinatarios,
      asunto: datos.asunto,
      cuerpo: datos.cuerpo,
    });
  }

  // cada destinatario recibe su propia copia: favoritos, leídos y eliminados son de cada uno
  private copiar(correo: ICorreoConsulta): CorreoElectronico {
    return new CorreoElectronico(correo.getId(), {
      remitente: correo.getRemitente(),
      destinatarios: correo.getDestinatarios(),
      asunto: correo.getAsunto(),
      cuerpo: correo.getCuerpo(),
      fecha: correo.getFecha(),
    });
  }

  private generarId(): string {
    this.setContador(this.getContador() + 1);
    return `M${this.getContador()}`;
  }

  private getUsuarios(): Map<string, IUsuario> {
    return this._usuarios;
  }

  private getContador(): number {
    return this._contador;
  }

  private setContador(valor: number): void {
    Validar(valor > 0, 'El contador de ids debe ser positivo');
    this._contador = valor;
  }
}