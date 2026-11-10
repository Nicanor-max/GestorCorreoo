import { describe, it, expect } from 'vitest';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { GestorBorradores } from '../Servicios/GestorBorradores';
import { ServicioEnvio } from '../Servicios/ServicioEnvio';
import { GestorLectura } from '../Servicios/GestorLectura';
import { GestorFavoritos } from '../Servicios/GestorFavoritos';
import { BuscadorCorreos } from '../Busqueda/BuscadorCorreos';
import { crearCriteriosBusqueda } from '../Busqueda/FabricaCriterios';
import { contacto } from './Ayudante';

// el escenario que se muestra en la daily del Sprint 2
describe('Escenario completo Sprint 2', () => {
  it('borrador → edición → envío → búsqueda → leído → favorito', () => {
    const gestor = new GestorBandejas(crearBandejas());
    const borradores = new GestorBorradores(gestor);
    const envio = new ServicioEnvio(gestor);
    const lectura = new GestorLectura(gestor);
    const favoritos = new GestorFavoritos(gestor, gestor);
    const buscador = new BuscadorCorreos(gestor, crearCriteriosBusqueda());

    // 1. crear un borrador incompleto
    borradores.guardar(new CorreoElectronico('B1', { remitente: contacto('nicanor@ucp.edu.ar') }));
    expect(() => envio.enviar('B1')).toThrow();

    // 2. editarlo y enviarlo
    borradores.editar('B1', { destinatarios: [contacto('esteban@ucp.edu.ar')], asunto: 'Daily Sprint 2' });
    envio.enviar('B1');

    // 3. verificar que aparece en Enviados
    expect(gestor.ubicacionDe('B1')).toBe(TipoBandeja.ENVIADOS);

    // 4. buscarlo por texto
    expect(buscador.buscarEnActivas('daily').map((c) => c.getId())).toEqual(['B1']);

    // 5. marcar un mensaje recibido como leído
    gestor.agregar(new CorreoElectronico('R1', { remitente: contacto('esteban@ucp.edu.ar'), destinatarios: [contacto('nicanor@ucp.edu.ar')], asunto: 'Re: Daily' }), TipoBandeja.ENTRADA);
    expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(1);
    lectura.marcarLeido('R1');
    expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(0);

    // 6. marcarlo como favorito y consultar la vista
    favoritos.marcar('R1');
    expect(favoritos.vista().map((c) => c.getId())).toEqual(['R1']);
    expect(gestor.ubicacionDe('R1')).toBe(TipoBandeja.ENTRADA);
  });
});