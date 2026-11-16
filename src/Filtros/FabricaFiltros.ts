import { FiltroPersonalizado } from './FiltroPersonalizado';
import { asuntoContiene, cuerpoContiene, esFavorito, esLeido, no, o, remitenteDelDominio, remitenteEs, y } from './Predicado';
import { IFiltro } from '../Interfaces/IFiltro';

// RF-05: los 5 filtros de ejemplo de la consigna (4 son complejos: combinan 2 o más campos)
export function crearFiltrosEjemplo(emailPrioritario: string): IFiltro[] {
  const deLaUcp = remitenteDelDominio('@ucp.edu.ar'); // predicado reutilizado

  return [
    new FiltroPersonalizado('Correos de la UCP', deLaUcp),
    new FiltroPersonalizado('Académicos importantes', y([deLaUcp, asuntoContiene('Examen')])),
    new FiltroPersonalizado('Pendientes de revisión', y([no(esLeido()), cuerpoContiene('Entrega')])),
    new FiltroPersonalizado('Personales prioritarios', y([esFavorito(), remitenteEs(emailPrioritario)])),
    new FiltroPersonalizado('Para seguimiento', y([o([asuntoContiene('Proyecto'), asuntoContiene('Reunión')]), no(esLeido())])),
  ];
}