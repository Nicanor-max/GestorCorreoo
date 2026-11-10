import { CriterioBusqueda } from './CriterioBusqueda';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

export class BusquedaPorAsunto extends CriterioBusqueda {
 protected override textosDe(correo: ICorreoConsulta): string[] {
 return [correo.getAsunto()];
 }
}
