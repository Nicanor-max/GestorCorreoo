import { CriterioBusqueda } from './CriterioBusqueda';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// herencia: busca en todos los destinatarios del correo
export class BusquedaPorDestinatario extends CriterioBusqueda {
  protected override textosDe(correo: ICorreoConsulta): string[] {
    return correo.getDestinatarios();
  }
}