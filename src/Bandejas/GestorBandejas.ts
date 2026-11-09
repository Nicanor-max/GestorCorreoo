import { TipoBandeja } from '../TipoBandeja';
import { IBandeja } from '../Interfaces/IBandeja';
import { IBandejaConsulta } from '../Interfaces/IBandejaConsulta';
import { ICorreoBandeja } from '../Interfaces/ICorreoBandeja';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { IGestorBandejas } from '../Interfaces/IGestorBandeja';
import { Validar } from '../Validar';

const TIPOS_OBLIGATORIOS: TipoBandeja[] = [
  TipoBandeja.ENTRADA,
  TipoBandeja.ENVIADOS,
  TipoBandeja.BORRADORES,
  TipoBandeja.ELIMINADOS,
];

// bandejas cuyos correos están "vivos" (todas menos Eliminados)
const TIPOS_ACTIVOS: TipoBandeja[] = [TipoBandeja.ENTRADA, TipoBandeja.ENVIADOS, TipoBandeja.BORRADORES];

export class GestorBandejas implements IGestorBandejas, IFuenteCorreos {
  // cada tipo de bandeja apunta a su bandeja
  private _bandejas: Map<TipoBandeja, IBandeja> = new Map();

  // inversión de dependencias: recibe las bandejas, no las crea
  constructor(bandejas: IBandeja[]) {
    bandejas.forEach((bandeja) => this.registrarBandeja(bandeja));
    const faltantes = TIPOS_OBLIGATORIOS.filter((tipo) => !this._bandejas.has(tipo));
    validar(faltantes.length === 0, 'El gestor necesita las bandejas Entrada, Enviados, Borradores y Eliminados');
  }

  public agregar(correo: ICorreoBandeja, destino: TipoBandeja): void {
    validar(this.ubicacionDe(correo.getId()) === null, `El correo ${correo.getId()} ya existe en el gestor`);
    this.getBandeja(destino).recibir(correo, null);
  }

  // primero recibe el destino (que valida); recién después se quita del origen
  public mover(idCorreo: string, destino: TipoBandeja): void {
    const origen = this.getBandeja(this.obtenerUbicacion(idCorreo));
    const correo = origen.obtener(idCorreo);
    this.getBandeja(destino).recibir(correo, origen.getTipo());
    origen.quitar(idCorreo);
  }

  public eliminar(idCorreo: string): void {
    this.mover(idCorreo, TipoBandeja.ELIMINADOS);
  }

  public restaurar(idCorreo: string): void {
    const correo = this.getBandeja(TipoBandeja.ELIMINADOS).obtener(idCorreo);
    this.mover(idCorreo, correo.getBandejaOrigen() as TipoBandeja);
  }

  public consultar(tipo: TipoBandeja): IBandejaConsulta {
    return this.getBandeja(tipo);
  }

  public ubicacionDe(idCorreo: string): TipoBandeja | null {
    const encontradas = TIPOS_OBLIGATORIOS.filter((tipo) => this.getBandeja(tipo).contiene(idCorreo));
    return encontradas.length === 0 ? null : encontradas[0];
  }

  // Sprint 2: busca el correo en la bandeja donde esté
  public obtenerCorreo(idCorreo: string): ICorreoBandeja {
    return this.getBandeja(this.obtenerUbicacion(idCorreo)).obtener(idCorreo);
  }

  public listarDe(tipo: TipoBandeja): ICorreoConsulta[] {
    return this.getBandeja(tipo).listar();
  }

  // junta los correos de Entrada, Enviados y Borradores en una sola lista
  public listarActivos(): ICorreoConsulta[] {
    return TIPOS_ACTIVOS.reduce<ICorreoConsulta[]>((todos, tipo) => [...todos, ...this.listarDe(tipo)], []);
  }

  private obtenerUbicacion(idCorreo: string): TipoBandeja {
    const tipo = this.ubicacionDe(idCorreo);
    validar(tipo !== null, `El correo ${idCorreo} no está en ninguna bandeja`);
    return tipo as TipoBandeja;
  }

  private getBandeja(tipo: TipoBandeja): IBandeja {
    return this._bandejas.get(tipo) as IBandeja;
  }

  private registrarBandeja(bandeja: IBandeja): void {
    validar(!this._bandejas.has(bandeja.getTipo()), `La bandeja ${bandeja.getTipo()} está repetida`);
    this._bandejas.set(bandeja.getTipo(), bandeja);
  }
}