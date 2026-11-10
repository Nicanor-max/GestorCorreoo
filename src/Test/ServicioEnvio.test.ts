import { describe, it, expect, beforeEach } from 'vitest';
import { ServicioEnvio } from '../Servicios/ServicioEnvio';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { contacto } from './Ayudante';

const completo = (id: string) =>
  new CorreoElectronico(id, { remitente: contacto('nicanor@ucp.edu.ar'), destinatarios: [contacto('esteban@ucp.edu.ar')], asunto: 'Sprint 2' });

describe('ServicioEnvio', () => {
  let gestor: GestorBandejas;
  let envio: ServicioEnvio;

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    envio = new ServicioEnvio(gestor);
  });

  it('envía un borrador completo y lo pasa a Enviados (RF02)', () => {
    gestor.agregar(completo('B1'), TipoBandeja.BORRADORES);
    envio.enviar('B1');
    expect(gestor.ubicacionDe('B1')).toBe(TipoBandeja.ENVIADOS);
    expect(gestor.consultar(TipoBandeja.BORRADORES).cantidad()).toBe(0);
  });

  it('el correo enviado queda marcado como leído', () => {
    gestor.agregar(completo('B1'), TipoBandeja.BORRADORES);
    envio.enviar('B1');
    expect(gestor.obtenerCorreo('B1').estaLeido()).toBe(true);
  });

  it('no envía un borrador sin destinatarios ni sin asunto', () => {
    gestor.agregar(new CorreoElectronico('B1', { remitente: contacto('a@b.com'), asunto: 'Hola' }), TipoBandeja.BORRADORES);
    gestor.agregar(new CorreoElectronico('B2', { remitente: contacto('a@b.com'), destinatarios: [contacto('x@y.com')] }), TipoBandeja.BORRADORES);
    expect(() => envio.enviar('B1')).toThrow('no tiene destinatarios');
    expect(() => envio.enviar('B2')).toThrow('no tiene asunto');
    expect(gestor.ubicacionDe('B1')).toBe(TipoBandeja.BORRADORES);
  });

  it('solo envía correos que están en Borradores', () => {
    gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
    expect(() => envio.enviar('C1')).toThrow('no es un borrador');
    expect(() => envio.enviar('NO-EXISTE')).toThrow();
  });

  it('envía un correo nuevo directamente a Enviados', () => {
    envio.enviarNuevo(completo('N1'));
    expect(gestor.ubicacionDe('N1')).toBe(TipoBandeja.ENVIADOS);
    expect(() => envio.enviarNuevo(new CorreoElectronico('N2', { remitente: contacto('a@b.com') }))).toThrow();
  });
});