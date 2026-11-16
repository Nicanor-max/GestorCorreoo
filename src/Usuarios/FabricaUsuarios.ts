import { Contacto } from '../Contactos/Contacto';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { crearCriteriosBusqueda } from '../Busqueda/FabricaCriterios';
import { AgendaContactos } from '../Contactos/AgendaContacto';
import { Usuario } from './Usuarios';
import { IUsuario } from '../Interfaces/IUsuarios';

// fábrica: cada usuario nuevo recibe su propia agenda, sus propias 4 bandejas y sus criterios de búsqueda
export function crearUsuario(nombre: string, email: string): IUsuario {
  const buzon = new GestorBandejas(crearBandejas());
  return new Usuario(new Contacto(nombre, email), new AgendaContactos(), buzon, buzon, crearCriteriosBusqueda());
}