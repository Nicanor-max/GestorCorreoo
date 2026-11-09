import { describe, it, expect, beforeEach } from 'vitest';
import { GestorLectura } from '../Servicios/GestorLectura';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
const completo = (id: string) =>
 new CorreoElectronico(id, { remitente: 'a@b.com', destinatarios: ['x@y.com'], asunto: 'Hola' });
describe('GestorLectura', () => {
 let gestor: GestorBandejas;
 let lectura: GestorLectura;
 beforeEach(() => {
 gestor = new GestorBandejas(crearBandejas());
 lectura = new GestorLectura(gestor);
 gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
 gestor.agregar(completo('C2'), TipoBandeja.ENTRADA);
 });
 it('los correos recibidos llegan sin leer', () => {
 expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(2);
 });
 it('marca como leído y no leído (RF08)', () => {
 lectura.marcarLeido('C1');
 expect(gestor.obtenerCorreo('C1').estaLeido()).toBe(true);
 expect(lectura.listarNoLeidos(TipoBandeja.ENTRADA).map((c) => c.getId())).toEqual(['C2']);
 lectura.marcarNoLeido('C1');
 expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(2);
 });
 it('marcar dos veces no cambia el resultado', () => {
 lectura.marcarLeido('C1');
 lectura.marcarLeido('C1');
 expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(1);
 });
 it('falla con correos que no existen', () => {
 expect(() => lectura.marcarLeido('NO-EXISTE')).toThrow();
 });
});
