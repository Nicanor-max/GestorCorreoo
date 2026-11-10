import { CriterioBusqueda } from './CriterioBusqueda';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

export class BusquedaPorRemitente extends CriterioBusqueda {
 protected override textosDe(correo: ICorreoConsulta): string[] {
 return [correo.getRemitente()];
 }
}
