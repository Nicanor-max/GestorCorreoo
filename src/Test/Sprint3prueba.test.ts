import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../Contactos/Contacto';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { GestorBorradores } from '../Servicios/GestorBorradores';
import { ServicioEnvio } from '../Servicios/ServicioEnvio';
import { GestorLectura } from '../Servicios/GestorLectura';
import { GestorFavoritos } from '../Servicios/GestorFavoritos';
import { BuscadorCorreos } from '../Busqueda/BuscadorCorreos';
import { crearCriteriosBusqueda } from '../Busqueda/FabricaCriterios';

// Flujo completo: enviar a 3 destinatarios, ver Enviados, eliminar uno,
// verlo en Eliminados, restaurarlo y probar todo lo que se puede hacer en el medio.
describe('Flujo: envío a 3 destinatarios y eliminación', () => {
  // personas
  const nicanor = new Contacto('Nicanor Pujol', 'nicanor@ucp.edu.ar');
  const esteban = new Contacto('Esteban Panigua', 'esteban@ucp.edu.ar');
  const profe = new Contacto('Profesor UCP', 'profe@ucp.edu.ar');
  const laura = new Contacto('Laura Gómez', 'laura@ucp.edu.ar');

  // sistema
  let gestor: GestorBandejas;
  let borradores: GestorBorradores;
  let envio: ServicioEnvio;
  let lectura: GestorLectura;
  let favoritos: GestorFavoritos;
  let buscador: BuscadorCorreos;

  // misma fecha para los 3 correos, así el orden de las listas es siempre C1, C2, C3
  const fecha = new Date('2026-11-10T10:00:00');

  // ids de una lista de correos
  const ids = (correos: { getId(): string }[]): string[] => correos.map((c) => c.getId());

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    borradores = new GestorBorradores(gestor);
    envio = new ServicioEnvio(gestor);
    lectura = new GestorLectura(gestor);
    favoritos = new GestorFavoritos(gestor, gestor);
    buscador = new BuscadorCorreos(gestor, crearCriteriosBusqueda());

    // envío 3 correos, el primero a 3 destinatarios
    envio.enviarNuevo(new CorreoElectronico('C1', {
      remitente: nicanor,
      destinatarios: [esteban, profe, laura],
      asunto: 'Entrega del Sprint 2',
      cuerpo: 'Les paso el avance del gestor de correos',
      fecha,
    }));
    envio.enviarNuevo(new CorreoElectronico('C2', {
      remitente: nicanor, destinatarios: [esteban], asunto: 'Reunión del martes', fecha,
    }));
    envio.enviarNuevo(new CorreoElectronico('C3', {
      remitente: nicanor, destinatarios: [profe], asunto: 'Consulta sobre el examen', fecha,
    }));
  });

  it('1. el correo a 3 destinatarios queda en Enviados con los 3 contactos', () => {
    const c1 = gestor.obtenerCorreo('C1');
    expect(gestor.ubicacionDe('C1')).toBe(TipoBandeja.ENVIADOS);
    expect(c1.getDestinatarios().length).toBe(3);
    expect(c1.getDestinatarios().map((d) => d.getNombre())).toEqual(['Esteban Panigua', 'Profesor UCP', 'Laura Gómez']);
    expect(c1.getEmailsDestinatarios()).toEqual(['esteban@ucp.edu.ar', 'profe@ucp.edu.ar', 'laura@ucp.edu.ar']);
    expect(c1.getRemitente().getNombre()).toBe('Nicanor Pujol');
  });

  it('2. Enviados tiene los 3 correos y las demás bandejas están vacías', () => {
    expect(gestor.consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(3);
    expect(ids(gestor.consultar(TipoBandeja.ENVIADOS).listar()).length).toBe(3);
    expect(gestor.consultar(TipoBandeja.ENTRADA).cantidad()).toBe(0);
    expect(gestor.consultar(TipoBandeja.BORRADORES).cantidad()).toBe(0);
    expect(gestor.consultar(TipoBandeja.ELIMINADOS).cantidad()).toBe(0);
  });

  it('3. los correos enviados quedan marcados como leídos', () => {
    expect(lectura.contarNoLeidos(TipoBandeja.ENVIADOS)).toBe(0);
  });

  it('4. elimino uno de los enviados: pasa a Eliminados y sale de Enviados', () => {
    gestor.eliminar('C2');

    expect(gestor.ubicacionDe('C2')).toBe(TipoBandeja.ELIMINADOS);
    expect(ids(gestor.consultar(TipoBandeja.ELIMINADOS).listar())).toEqual(['C2']);
    expect(gestor.consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(2);
    expect(gestor.consultar(TipoBandeja.ENVIADOS).contiene('C2')).toBe(false);
  });

  it('5. la eliminación es lógica: el correo conserva sus datos y recuerda que venía de Enviados', () => {
    gestor.eliminar('C2');
    const c2 = gestor.obtenerCorreo('C2');
    expect(c2.estaEliminado()).toBe(true);
    expect(c2.getBandejaOrigen()).toBe(TipoBandeja.ENVIADOS);
    expect(c2.getAsunto()).toBe('Reunión del martes');
    expect(c2.getEmailsDestinatarios()).toEqual(['esteban@ucp.edu.ar']);
  });

  it('6. un correo eliminado no se puede eliminar de nuevo ni mover a otra bandeja', () => {
    gestor.eliminar('C2');
    expect(() => gestor.eliminar('C2')).toThrow();
    expect(() => gestor.mover('C2', TipoBandeja.ENTRADA)).toThrow();
    expect(gestor.ubicacionDe('C2')).toBe(TipoBandeja.ELIMINADOS);
  });

  it('7. restauro el correo: vuelve a Enviados y Eliminados queda vacío', () => {
    gestor.eliminar('C2');
    gestor.restaurar('C2');

    expect(gestor.ubicacionDe('C2')).toBe(TipoBandeja.ENVIADOS);
    expect(gestor.obtenerCorreo('C2').estaEliminado()).toBe(false);
    expect(gestor.consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(3);
    expect(gestor.consultar(TipoBandeja.ELIMINADOS).cantidad()).toBe(0);
  });

  it('8. un favorito eliminado sale de la vista y vuelve al restaurarlo con su estrella', () => {
    favoritos.marcar('C1');
    favoritos.marcar('C3');
    expect(ids(favoritos.vista())).toEqual(['C1', 'C3']);

    gestor.eliminar('C1');
    expect(ids(favoritos.vista())).toEqual(['C3']);
    expect(gestor.obtenerCorreo('C1').esFavorito()).toBe(true);

    gestor.restaurar('C1');
    expect(favoritos.vista().length).toBe(2);
    expect(ids(favoritos.vista())).toContain('C1');
  });

  it('9. la búsqueda encuentra al correo por cualquiera de sus 3 destinatarios y no busca en Eliminados', () => {
    expect(ids(buscador.buscarEnActivas('laura'))).toEqual(['C1']);
    expect(ids(buscador.buscarEnActivas('profe'))).toEqual(['C1', 'C3']);
    expect(ids(buscador.buscarEn(TipoBandeja.ENVIADOS, 'Esteban Panigua'))).toEqual(['C1', 'C2']);

    gestor.eliminar('C1');
    expect(ids(buscador.buscarEnActivas('laura'))).toEqual([]);
    expect(ids(buscador.buscarEn(TipoBandeja.ELIMINADOS, 'laura'))).toEqual(['C1']);
  });

  it('10. un borrador con 3 destinatarios se edita, se envía y después se elimina', () => {
    borradores.guardar(new CorreoElectronico('B1', { remitente: nicanor }));
    expect(() => envio.enviar('B1')).toThrow('no tiene destinatarios');

    borradores.editar('B1', { destinatarios: [esteban, profe, laura], asunto: 'Aviso importante' });
    envio.enviar('B1');
    expect(gestor.ubicacionDe('B1')).toBe(TipoBandeja.ENVIADOS);
    expect(gestor.obtenerCorreo('B1').getDestinatarios().length).toBe(3);

    gestor.eliminar('B1');
    expect(gestor.ubicacionDe('B1')).toBe(TipoBandeja.ELIMINADOS);
    expect(gestor.obtenerCorreo('B1').getBandejaOrigen()).toBe(TipoBandeja.ENVIADOS);
  });

  it('11. no se puede enviar dos veces el mismo correo ni repetir un destinatario', () => {
    expect(() => envio.enviarNuevo(new CorreoElectronico('C1', {
      remitente: nicanor, destinatarios: [esteban], asunto: 'Duplicado',
    }))).toThrow();
    expect(() => envio.enviarNuevo(new CorreoElectronico('C9', {
      remitente: nicanor, destinatarios: [esteban, profe, esteban], asunto: 'Repetido',
    }))).toThrow('repetidos');
    expect(gestor.consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(3);
  });

  it('12. los destinatarios del correo no se pueden modificar desde afuera', () => {
    const c1 = gestor.obtenerCorreo('C1');
    c1.getDestinatarios().pop();
    expect(c1.getDestinatarios().length).toBe(3);
  });
});