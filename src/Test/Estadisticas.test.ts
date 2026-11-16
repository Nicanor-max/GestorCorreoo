import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../Contactos/Contacto';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { EstadisticasCorreos } from '../Estadisticas/EstadisticasCorreo';
import { remitenteDelDominio, y, asuntoContiene } from '../Filtros/Predicado';

// RF-10: estadísticas con map, filter, reduce, forEach y Map
describe('RF-10 Estadísticas', () => {
  const yo = new Contacto('Nicanor Pujol', 'nicanor@ucp.edu.ar');
  const profe = new Contacto('Profesor UCP', 'profe@ucp.edu.ar');
  const esteban = new Contacto('Esteban Panigua', 'esteban@ucp.edu.ar');
  const amigo = new Contacto('Juan Amigo', 'juan@gmail.com');
  const fecha = new Date('2026-11-10T10:00:00');

  let gestor: GestorBandejas;
  let estadisticas: EstadisticasCorreos;

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    estadisticas = new EstadisticasCorreos(gestor);
    gestor.agregar(new CorreoElectronico('E1', { remitente: profe, destinatarios: [yo], asunto: 'Examen', fecha }), TipoBandeja.ENTRADA);
    gestor.agregar(new CorreoElectronico('E2', { remitente: profe, destinatarios: [yo, esteban], asunto: 'Notas', fecha }), TipoBandeja.ENTRADA);
    gestor.agregar(new CorreoElectronico('E3', { remitente: amigo, destinatarios: [yo], asunto: 'Asado', fecha }), TipoBandeja.ENTRADA);
    gestor.agregar(new CorreoElectronico('S1', { remitente: yo, destinatarios: [profe, esteban, amigo], asunto: 'Consulta', fecha }), TipoBandeja.ENVIADOS);
  });

  it('1. map: lista de asuntos de una bandeja', () => {
    expect(estadisticas.asuntosDe(TipoBandeja.ENTRADA)).toEqual(['Examen', 'Notas', 'Asado']);
    expect(estadisticas.asuntosDe(TipoBandeja.BORRADORES)).toEqual([]);
  });

  it('2. filter: correos que cumplen una condición (se pueden usar los predicados del RF-05)', () => {
    const deLaUcp = estadisticas.correosQueCumplen(TipoBandeja.ENTRADA, remitenteDelDominio('@ucp.edu.ar'));
    expect(deLaUcp.map((c) => c.getId())).toEqual(['E1', 'E2']);
    const examenUcp = estadisticas.correosQueCumplen(TipoBandeja.ENTRADA, y([remitenteDelDominio('@ucp.edu.ar'), asuntoContiene('examen')]));
    expect(examenUcp.map((c) => c.getId())).toEqual(['E1']);
  });

  it('3. forEach + Map: cantidad de correos por bandeja', () => {
    const cantidades = estadisticas.cantidadPorBandeja();
    expect(cantidades.get(TipoBandeja.ENTRADA)).toBe(3);
    expect(cantidades.get(TipoBandeja.ENVIADOS)).toBe(1);
    expect(cantidades.get(TipoBandeja.BORRADORES)).toBe(0);
    expect(cantidades.get(TipoBandeja.ELIMINADOS)).toBe(0);
  });

  it('4. reduce: no leídos y favoritos', () => {
    expect(estadisticas.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(3);
    gestor.obtenerCorreo('E1').marcarLeido();
    expect(estadisticas.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(2);

    gestor.obtenerCorreo('E2').marcarFavorito();
    gestor.obtenerCorreo('E3').marcarFavorito();
    expect(estadisticas.contarFavoritos()).toBe(2);
    gestor.eliminar('E3'); // un favorito eliminado no cuenta
    expect(estadisticas.contarFavoritos()).toBe(1);
  });

  it('5. reduce + Map: correos por remitente', () => {
    const porRemitente = estadisticas.correosPorRemitente(TipoBandeja.ENTRADA);
    expect(porRemitente.get('profe@ucp.edu.ar')).toBe(2);
    expect(porRemitente.get('juan@gmail.com')).toBe(1);
    expect(porRemitente.size).toBe(2);
  });

  it('6. reduce: total y promedio de destinatarios', () => {
    expect(estadisticas.totalDestinatarios(TipoBandeja.ENTRADA)).toBe(4);
    expect(estadisticas.promedioDestinatarios(TipoBandeja.ENVIADOS)).toBe(3);
    expect(estadisticas.promedioDestinatarios(TipoBandeja.BORRADORES)).toBe(0);
  });

  it('7. las estadísticas no modifican los correos', () => {
    const antes = gestor.listarDe(TipoBandeja.ENTRADA).map((c) => c.obtenerDatos());
    estadisticas.asuntosDe(TipoBandeja.ENTRADA);
    estadisticas.correosPorRemitente(TipoBandeja.ENTRADA);
    estadisticas.contarNoLeidos(TipoBandeja.ENTRADA);
    expect(gestor.listarDe(TipoBandeja.ENTRADA).map((c) => c.obtenerDatos())).toEqual(antes);
  });
});