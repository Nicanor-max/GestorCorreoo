import { describe, it, expect, beforeEach } from 'vitest';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { ServicioEnvio } from '../Servicios/ServicioEnvio';
import { GestorBorradores } from '../Servicios/GestorBorradores';
import { BuscadorCorreos } from '../Busqueda/BuscadorCorreos';
import { BusquedaPorAsunto } from '../Busqueda/BusquedaPorAsunto';
import { BusquedaPorDestinatario } from '../Busqueda/BusquedaPorDestinatario';
import { crearCriteriosBusqueda } from '../Busqueda/FabricaCriterios';

// arma la lista persona1@ucp.edu.ar ... personaN@ucp.edu.ar
const crearPersonas = (cantidad: number): string[] => {
  const personas: string[] = [];
  for (let i = 1; i <= cantidad; i++) {
    personas.push(`persona${i}@ucp.edu.ar`);
  }
  return personas;
};

describe('Envío masivo y búsqueda por número (pedido del profe)', () => {
  let gestor: GestorBandejas;
  let envio: ServicioEnvio;
  let buscador: BuscadorCorreos;

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    envio = new ServicioEnvio(gestor);
    buscador = new BuscadorCorreos(gestor, crearCriteriosBusqueda());
  });

  it('envía un correo a 100 personas (RF02)', () => {
    const personas = crearPersonas(100);
    const borradores = new GestorBorradores(gestor);
    borradores.guardar(new CorreoElectronico('MASIVO', { remitente: 'nicanor@ucp.edu.ar' }));
    borradores.editar('MASIVO', { destinatarios: personas, asunto: 'Aviso a todo el curso' });

    envio.enviar('MASIVO');

    const enviado = gestor.obtenerCorreo('MASIVO');
    expect(gestor.ubicacionDe('MASIVO')).toBe(TipoBandeja.ENVIADOS);
    expect(enviado.getDestinatarios().length).toBe(100);
    expect(enviado.getDestinatarios()[0]).toBe('persona1@ucp.edu.ar');
    expect(enviado.getDestinatarios()[99]).toBe('persona100@ucp.edu.ar');
  });

  it('no deja enviar a 100 personas si una está repetida', () => {
    const personas = [...crearPersonas(99), 'persona1@ucp.edu.ar'];
    expect(() => envio.enviarNuevo(new CorreoElectronico('REP', {
      remitente: 'nicanor@ucp.edu.ar', destinatarios: personas, asunto: 'Aviso',
    }))).toThrow('repetidos');
  });

  it('encuentra a la persona número 57 entre los 100 destinatarios (RF04)', () => {
    envio.enviarNuevo(new CorreoElectronico('MASIVO', {
      remitente: 'nicanor@ucp.edu.ar', destinatarios: crearPersonas(100), asunto: 'Aviso a todo el curso',
    }));
    const resultado = buscador.buscarCon(new BusquedaPorDestinatario(), 'persona57@');
    expect(resultado.map((c) => c.getId())).toEqual(['MASIVO']);
    expect(buscador.buscarCon(new BusquedaPorDestinatario(), 'persona101@')).toEqual([]);
  });

  it('envía 100 correos numerados y busca el número 57 (RF04)', () => {
    crearPersonas(100).forEach((persona, i) => {
      envio.enviarNuevo(new CorreoElectronico(`C${i + 1}`, {
        remitente: 'nicanor@ucp.edu.ar', destinatarios: [persona], asunto: `Correo número ${i + 1}`,
      }));
    });
    expect(gestor.consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(100);

    const resultado = buscador.buscarCon(new BusquedaPorAsunto(), 'número 57');
    expect(resultado.length).toBe(1);
    expect(resultado[0].getId()).toBe('C57');
    expect(resultado[0].getDestinatarios()).toEqual(['persona57@ucp.edu.ar']);
  });
});