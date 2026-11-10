import { CriterioBusqueda } from './CriterioBusqueda';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

export class BusquedaPorCuerpo extends CriterioBusqueda {
 protected override textosDe(correo: ICorreoConsulta): string[] {
 return [correo.getCuerpo()];
 }
}