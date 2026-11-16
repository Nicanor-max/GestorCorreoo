import { TipoBandeja } from '../TipoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IEstadisticasCorreos } from '../Interfaces/IEstadisticasCorreo';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { Predicado } from '../Interfaces/IPredicado';

const TODAS_LAS_BANDEJAS: TipoBandeja[] = [
  TipoBandeja.ENTRADA,
  TipoBandeja.ENVIADOS,
  TipoBandeja.BORRADORES,
  TipoBandeja.ELIMINADOS,
];

// RF-10: información resumida usando solo map, filter, reduce, forEach y Map.
// Solo lee los correos: nunca los modifica.
export class EstadisticasCorreos implements IEstadisticasCorreos {
  private _fuente: IFuenteCorreos;

  constructor(fuente: IFuenteCorreos) {
    this._fuente = fuente;
  }

  // map: de cada correo me quedo con su asunto
  public asuntosDe(tipo: TipoBandeja): string[] {
    return this.correosDe(tipo).map((correo) => correo.getAsunto());
  }

  // filter: los correos que cumplen la condición (puede ser un predicado del RF-05)
  public correosQueCumplen(tipo: TipoBandeja, condicion: Predicado): ICorreoConsulta[] {
    return this.correosDe(tipo).filter(condicion);
  }

  // forEach + Map: cuántos correos hay en cada bandeja
  public cantidadPorBandeja(): Map<TipoBandeja, number> {
    const cantidades: Map<TipoBandeja, number> = new Map();
    TODAS_LAS_BANDEJAS.forEach((tipo) => cantidades.set(tipo, this.correosDe(tipo).length));
    return cantidades;
  }

  // reduce: va sumando 1 por cada no leído
  public contarNoLeidos(tipo: TipoBandeja): number {
    return this.correosDe(tipo).reduce((total, correo) => (correo.estaLeido() ? total : total + 1), 0);
  }

  // reduce sobre los correos activos (los eliminados no cuentan)
  public contarFavoritos(): number {
    return this.getFuente().listarActivos().reduce((total, correo) => (correo.esFavorito() ? total + 1 : total), 0);
  }

  // reduce + Map: cuántos correos mandó cada remitente
  public correosPorRemitente(tipo: TipoBandeja): Map<string, number> {
    return this.correosDe(tipo).reduce((conteo, correo) => {
      const email = correo.getEmailRemitente();
      const anterior = conteo.has(email) ? (conteo.get(email) as number) : 0;
      conteo.set(email, anterior + 1);
      return conteo;
    }, new Map<string, number>());
  }

  // reduce: suma la cantidad de destinatarios de todos los correos
  public totalDestinatarios(tipo: TipoBandeja): number {
    return this.correosDe(tipo).reduce((total, correo) => total + correo.getDestinatarios().length, 0);
  }

  public promedioDestinatarios(tipo: TipoBandeja): number {
    const cantidad = this.correosDe(tipo).length;
    return cantidad === 0 ? 0 : this.totalDestinatarios(tipo) / cantidad;
  }

  private correosDe(tipo: TipoBandeja): ICorreoConsulta[] {
    return this.getFuente().listarDe(tipo);
  }

  private getFuente(): IFuenteCorreos {
    return this._fuente;
  }
}