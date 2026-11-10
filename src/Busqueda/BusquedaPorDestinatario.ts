import { CriterioBusqueda } from './CriterioBusqueda';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// herencia: busca en el nombre y en el email de todos los destinatarios
export class BusquedaPorDestinatario extends CriterioBusqueda {
  protected override textosDe(correo: ICorreoConsulta): string[] {
    return correo.getDestinatarios()
      .reduce<string[]>((textos, d) => [...textos, d.getNombre(), d.getEmail()], []);
  }
}