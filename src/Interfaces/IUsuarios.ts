import { IContactoConsulta } from './IContactoConsulta';
import { IGestorBandejas } from './IGestorBandeja';
import { IGestorBorradores } from './IGestorBorradores';
import { IServicioEnvio } from './IServicioEnvio';
import { IGestorLectura } from './IGestorLectura';
import { IGestorFavoritos } from './IGestorFavoritos';
import { IBuscadorCorreos } from './IBuscadorCorreos';
import { IAgendaConsulta } from './IAgendaConsulta';
import { IAgendaModificacion } from './IAgendaModificacion';
import { IGestorFiltros } from './IGestorFiltros';
import { IEstadisticasCorreos } from './IEstadisticasCorreo';

// Cada usuario tiene su propio buzón y sus propios servicios
export interface IUsuario {
  getNombre(): string;
  getEmail(): string;
  getContacto(): IContactoConsulta;
  getAgenda(): IAgendaConsulta & IAgendaModificacion;
  getBandejas(): IGestorBandejas;
  getBorradores(): IGestorBorradores;
  getEnvio(): IServicioEnvio;
  getLectura(): IGestorLectura;
  getFavoritos(): IGestorFavoritos;
  getBuscador(): IBuscadorCorreos;
  getFiltros(): IGestorFiltros;
  getEstadisticas(): IEstadisticasCorreos;
}