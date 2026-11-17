import { describe, it, expect, beforeEach } from 'vitest';
import { GestorLectura } from '../Servicios/GestorLectura';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { contacto } from './Ayudante';

// arma un correo completo (remitente, destinatario y asunto) para poder recibirlo
const completo = (id: string) =>
  new CorreoElectronico(id, {
    remitente: contacto('a@b.com'),
    destinatarios: [contacto('x@y.com')],
    asunto: 'Hola',
  });

// RF-08: marcar correos como leídos o no leídos
describe('GestorLectura', () => {
  let gestor: GestorBandejas;
  let lectura: GestorLectura;

  // antes de cada test: un buzón nuevo con 2 correos recibidos
  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    lectura = new GestorLectura(gestor);
    gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
    gestor.agregar(completo('C2'), TipoBandeja.ENTRADA);
  });

  it('1. los correos recibidos llegan sin leer', () => {
    expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(2);
  });

  it('2. marca como leído y como no leído', () => {
    lectura.marcarLeido('C1');
    expect(gestor.obtenerCorreo('C1').estaLeido()).toBe(true);
    expect(lectura.listarNoLeidos(TipoBandeja.ENTRADA).map((c) => c.getId())).toEqual(['C2']);

    lectura.marcarNoLeido('C1');
    expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(2);
  });

  it('3. marcar dos veces como leído no cambia el resultado', () => {
    lectura.marcarLeido('C1');
    lectura.marcarLeido('C1');
    expect(lectura.contarNoLeidos(TipoBandeja.ENTRADA)).toBe(1);
  });

  it('4. falla con un correo que no existe', () => {
    expect(() => lectura.marcarLeido('NO-EXISTE')).toThrow();
  });
});