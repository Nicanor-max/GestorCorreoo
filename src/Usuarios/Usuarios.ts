import { Contacto } from '../Contactos/Contacto';
import { GestorBorradores } from '../Servicios/GestorBorradores';
import { ServicioEnvio } from '../Servicios/ServicioEnvio';
import { GestorLectura } from '../Servicios/GestorLectura';
import { GestorFavoritos } from '../Servicios/GestorFavoritos';
import { BuscadorCorreos } from '../Busqueda/BuscadorCorreos';
import { GestorFiltros } from '../Filtros/GestorFiltros';
import { EstadisticasCorreos } from '../Estadisticas/EstadisticasCorreo';
import { IUsuario } from '../Interfaces/IUsuarios';
import { IContactoConsulta } from '../Interfaces/IContactoConsulta';
import { IGestorBandejas } from '../Interfaces/IGestorBandeja';
import { IFuenteCorreos } from '../Interfaces/IFuenteCorreos';
import { IGestorBorradores } from '../Interfaces/IGestorBorradores';
import { IServicioEnvio } from '../Interfaces/IServicioEnvio';
import { IGestorLectura } from '../Interfaces/IGestorLectura';
import { IGestorFavoritos } from '../Interfaces/IGestorFavoritos';
import { IBuscadorCorreos } from '../Interfaces/IBuscadorCorreos';
import { ICriterioBusqueda } from '../Interfaces/ICriterioBusqueda';
import { IAgendaConsulta } from '../Interfaces/IAgendaConsulta';
import { IAgendaModificacion } from '../Interfaces/IAgendaModificacion';
import { IGestorFiltros } from '../Interfaces/IGestorFiltros';
import { IEstadisticasCorreos } from '../Interfaces/IEstadisticasCorreo';

// Un usuario = su contacto + SU agenda + SU buzón (4 bandejas) + sus servicios, filtros y estadísticas.
// Como cada usuario tiene su propio gestor, lo que haga uno no afecta a los demás.
export class Usuario implements IUsuario {
  private _contacto: Contacto;
  private _agenda: IAgendaConsulta & IAgendaModificacion;
  private _bandejas: IGestorBandejas;
  private _borradores: IGestorBorradores;
  private _envio: IServicioEnvio;
  private _lectura: IGestorLectura;
  private _favoritos: IGestorFavoritos;
  private _buscador: IBuscadorCorreos;
  private _filtros: IGestorFiltros;
  private _estadisticas: IEstadisticasCorreos;

  // inversión de dependencias: recibe su agenda, su buzón y los criterios ya armados
  constructor(
    contacto: IContactoConsulta,
    agenda: IAgendaConsulta & IAgendaModificacion,
    bandejas: IGestorBandejas,
    fuente: IFuenteCorreos,
    criterios: ICriterioBusqueda[],
  ) {
    this._contacto = new Contacto(contacto.getNombre(), contacto.getEmail());
    this._agenda = agenda;
    this._bandejas = bandejas;
    // todos los servicios del usuario trabajan sobre SU buzón
    this._borradores = new GestorBorradores(bandejas);
    this._envio = new ServicioEnvio(bandejas);
    this._lectura = new GestorLectura(bandejas);
    this._favoritos = new GestorFavoritos(bandejas, fuente);
    this._buscador = new BuscadorCorreos(fuente, criterios);
    this._filtros = new GestorFiltros(fuente);
    this._estadisticas = new EstadisticasCorreos(fuente);
  }

  public getNombre(): string {
    return this.getContacto().getNombre();
  }

  public getEmail(): string {
    return this.getContacto().getEmail();
  }

  // devuelve una copia: desde afuera no se le puede cambiar el nombre al usuario
  public getContacto(): IContactoConsulta {
    return new Contacto(this._contacto.getNombre(), this._contacto.getEmail());
  }

  // RF-03: cada usuario administra su propia agenda
  public getAgenda(): IAgendaConsulta & IAgendaModificacion {
    return this._agenda;
  }

  public getBandejas(): IGestorBandejas {
    return this._bandejas;
  }

  public getBorradores(): IGestorBorradores {
    return this._borradores;
  }

  public getEnvio(): IServicioEnvio {
    return this._envio;
  }

  public getLectura(): IGestorLectura {
    return this._lectura;
  }

  public getFavoritos(): IGestorFavoritos {
    return this._favoritos;
  }

  public getBuscador(): IBuscadorCorreos {
    return this._buscador;
  }

  public getFiltros(): IGestorFiltros {
    return this._filtros;
  }

  public getEstadisticas(): IEstadisticasCorreos {
    return this._estadisticas;
  }
}