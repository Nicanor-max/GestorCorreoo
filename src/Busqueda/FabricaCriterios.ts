import { BusquedaPorAsunto } from './BusquedaPorAsunto';
import { BusquedaPorCuerpo } from './BusquedaPorCuerpo';
import { BusquedaPorDestinatario } from './BusquedaPorDestinatario';
import { BusquedaPorRemitente } from './BusquedaPorRemitente';
import { ICriterioBusqueda } from '../Interfaces/ICriterioBusqueda';
export function crearCriteriosBusqueda(): ICriterioBusqueda[] {
 return [new BusquedaPorAsunto(), new BusquedaPorCuerpo(), new BusquedaPorRemitente(), new
 BusquedaPorDestinatario()];
}