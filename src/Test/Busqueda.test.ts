import { describe, it, expect, beforeEach } from 'vitest';
import { BuscadorCorreos } from '../Busqueda/BuscadorCorreos';
import { BusquedaPorAsunto } from '../Busqueda/BusquedaPorAsunto';
import { BusquedaPorCuerpo } from '../Busqueda/BusquedaPorCuerpo';
import { BusquedaPorRemitente } from '../Busqueda/BusquedaPorRemitente';
import { BusquedaPorDestinatario } from '../Busqueda/BusquedaPorDestinatario';
import { CriterioBusqueda } from '../Busqueda/CriterioBusqueda';
import { crearCriteriosBusqueda } from '../Busqueda/FabricaCriterios';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
const correo = new CorreoElectronico('C1', {
 remitente: 'nicanor@ucp.edu.ar',
 destinatarios: ['esteban@ucp.edu.ar', 'profe@ucp.edu.ar'],
 asunto: 'Entrega Sprint 2',
 cuerpo: 'Adjunto los Tests del gestor',
});
describe('Criterios de búsqueda', () => {
 it('cada criterio busca en su campo (polimorfismo)', () => {
 expect(new BusquedaPorAsunto().coincide(correo, 'sprint')).toBe(true);
 expect(new BusquedaPorCuerpo().coincide(correo, 'tests')).toBe(true);
 expect(new BusquedaPorRemitente().coincide(correo, 'nicanor')).toBe(true);
 expect(new BusquedaPorDestinatario().coincide(correo, 'profe')).toBe(true);
 expect(new BusquedaPorAsunto().coincide(correo, 'nicanor')).toBe(false);
 });
 it('es parcial y no distingue mayúsculas (RF04)', () => {
 expect(new BusquedaPorAsunto().coincide(correo, 'ENTREGA')).toBe(true);
 expect(new BusquedaPorAsunto().coincide(correo, ' ega sp ')).toBe(true);
 });
 it('todos se usan igual a través de la clase base', () => {
 const criterios: CriterioBusqueda[] = [new BusquedaPorAsunto(), new BusquedaPorCuerpo()];
 expect(criterios.map((c) => c.coincide(correo, 'gestor'))).toEqual([false, true]);
 });
});
describe('BuscadorCorreos', () => {
 let gestor: GestorBandejas;
 let buscador: BuscadorCorreos;
 beforeEach(() => {
 gestor = new GestorBandejas(crearBandejas());
 buscador = new BuscadorCorreos(gestor, crearCriteriosBusqueda());
 gestor.agregar(new CorreoElectronico('C1', { remitente: 'esteban@ucp.edu.ar', destinatarios: [
 'nicanor@ucp.edu.ar'], asunto: 'Sprint 2' }), TipoBandeja.ENTRADA);
 gestor.agregar(new CorreoElectronico('C2', { remitente: 'nicanor@ucp.edu.ar', destinatarios: [
 'profe@ucp.edu.ar'], asunto: 'Consulta', cuerpo: 'Sobre el sprint' }), TipoBandeja.ENVIADOS);
 gestor.agregar(new CorreoElectronico('C3', { remitente: 'banco@mail.com', destinatarios: [
 'nicanor@ucp.edu.ar'], asunto: 'Resumen' }), TipoBandeja.ENTRADA);
 });
 it('busca en todos los campos y todas las bandejas activas (RF04)', () => {
 expect(buscador.buscar('sprint').map((c) => c.getId())).toEqual(['C1', 'C2']);
 expect(buscador.buscar('profe').map((c) => c.getId())).toEqual(['C2']);
 });
 it('no repite un correo que coincide en varios campos', () => {
 expect(buscador.buscar('nicanor').map((c) => c.getId())).toEqual(['C1', 'C3', 'C2']);
 });
 it('busca dentro de una bandeja', () => {
 expect(buscador.buscarEn(TipoBandeja.ENVIADOS, 'sprint').map((c) => c.getId())).toEqual(['C2']);
 });
 it('busca con un solo criterio', () => {
 expect(buscador.buscarCon(new BusquedaPorAsunto(), 'sprint').map((c) => c.getId())).toEqual(['C1']);
 });
 it('no busca en Eliminados', () => {
 gestor.eliminar('C1');
 expect(buscador.buscar('sprint').map((c) => c.getId())).toEqual(['C2']);
 });
 it('rechaza texto vacío y buscador sin criterios', () => {
 expect(() => buscador.buscar(' ')).toThrow();
 expect(() => new BuscadorCorreos(gestor, [])).toThrow();
 });
});
