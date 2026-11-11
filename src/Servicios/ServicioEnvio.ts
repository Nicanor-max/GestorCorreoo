import { TipoBandeja } from '../TipoBandeja';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IGestorBandejas } from '../Interfaces/IGestorBandeja';
import { IServicioEnvio } from '../Interfaces/IServicioEnvio';
import { Validar } from '../Validar';

// RF2 envío simulado de correos
export class ServicioEnvio implements IServicioEnvio {
  private _gestor: IGestorBandejas;

  // inversión de dependencias: trabaja sobre la interfaz del gestor
  constructor(gestor: IGestorBandejas) {
    this._gestor = gestor;
  }

  // envía un borrador: valida y lo pasa de Borradores a Enviados
  public enviar(idBorrador: string): void {
    Validar(this.getGestor().ubicacionDe(idBorrador) === TipoBandeja.BORRADORES, `El correo ${idBorrador} no es un borrador`);
    this.validarParaEnviar(this.getGestor().obtenerCorreo(idBorrador));
    this.getGestor().mover(idBorrador, TipoBandeja.ENVIADOS);
  }

  // envía un correo nuevo directamente a Enviados
  public enviarNuevo(correo: ICorreoBandeja): void {
    this.validarParaEnviar(correo);
    this.getGestor().agregar(correo, TipoBandeja.ENVIADOS);
  }

  // el remitente ya se valida al crear el correo; acá se controla lo que puede faltar
  private validarParaEnviar(correo: ICorreoConsulta): void {
    Validar(correo.getDestinatarios().length > 0, `El correo ${correo.getId()} no tiene destinatarios`);
    Validar(correo.getAsunto() !== '', `El correo ${correo.getId()} no tiene asunto`);
  }

  private getGestor(): IGestorBandejas {
    return this._gestor;
  }
}