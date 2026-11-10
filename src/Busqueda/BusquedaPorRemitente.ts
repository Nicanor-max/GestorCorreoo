import { CriterioBusqueda } from './CriterioBusqueda';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// herencia: busca en el nombre y en el email del remitente
export class BusquedaPorRemitente extends CriterioBusqueda {
  protected override textosDe(correo: ICorreoConsulta): string[] {
    const remitente = correo.getRemitente();
    return [remitente.getNombre(), remitente.getEmail()];
  }
}