import { describe, it, expect } from 'vitest';
import { Contacto } from '../Contactos/Contacto';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { TipoBandeja } from '../TipoBandeja';
import { contacto } from './Ayudante';

const fecha = new Date('2026-11-02T10:00:00');

describe('CorreoElectronico', () => {
  it('se crea con sus atributos (RF01)', () => {
    const nicanor = new Contacto('Nicanor Pujol', 'Nicanor@ucp.edu.ar');
    const esteban = new Contacto('Esteban Panigua', 'esteban@ucp.edu.ar');
    const correo = new CorreoElectronico('C1', {
      remitente: nicanor,
      destinatarios: [esteban],
      asunto: ' Sprint 1 ',
      cuerpo: 'Hola',
      fecha,
    });
    expect(correo.obtenerDatos()).toEqual({
      id: 'C1',
      remitente: { nombre: 'Nicanor Pujol', email: 'nicanor@ucp.edu.ar' },
      destinatarios: [{ nombre: 'Esteban Panigua', email: 'esteban@ucp.edu.ar' }],
      asunto: 'Sprint 1',
      cuerpo: 'Hola',
      fecha,
      leido: false,
      favorito: false,
      eliminado: false,
      bandejaOrigen: null,
    });
    expect(correo.estaCompleto()).toBe(true);
  });

  it('remitente y destinatarios son objetos Contacto (RF01)', () => {
    const correo = new CorreoElectronico('C1', {
      remitente: new Contacto('Nicanor Pujol', 'nicanor@ucp.edu.ar'),
      destinatarios: [new Contacto('Esteban Panigua', 'esteban@ucp.edu.ar'), new Contacto('Profe', 'profe@ucp.edu.ar')],
    });
    expect(correo.getRemitente().getNombre()).toBe('Nicanor Pujol');
    expect(correo.getEmailRemitente()).toBe('nicanor@ucp.edu.ar');
    expect(correo.getDestinatarios().map((d) => d.getNombre())).toEqual(['Esteban Panigua', 'Profe']);
    expect(correo.getEmailsDestinatarios()).toEqual(['esteban@ucp.edu.ar', 'profe@ucp.edu.ar']);
  });

  it('cambiar o borrar el contacto original no altera el correo histórico (RF01 y RF03)', () => {
    const esteban = new Contacto('Esteban Panigua', 'esteban@ucp.edu.ar');
    const correo = new CorreoElectronico('C1', { remitente: contacto('nicanor@ucp.edu.ar'), destinatarios: [esteban] });
    esteban.cambiarNombre('Otro nombre');
    expect(correo.getDestinatarios()[0].getNombre()).toBe('Esteban Panigua');
  });

  it('valida id, remitente y destinatarios', () => {
    expect(() => new CorreoElectronico('', { remitente: contacto('a@b.com') })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: contacto('malo') })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: contacto('a@b.com'), destinatarios: [contacto('malo')] })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: contacto('a@b.com'), destinatarios: [contacto('x@y.com'), contacto('X@y.com')] })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: contacto('a@b.com'), fecha: new Date('nada') })).toThrow();
  });

  it('sin destinatarios o sin asunto queda incompleto', () => {
    expect(new CorreoElectronico('C1', { remitente: contacto('a@b.com'), asunto: 'Hola' }).estaCompleto()).toBe(false);
    expect(new CorreoElectronico('C2', { remitente: contacto('a@b.com'), destinatarios: [contacto('x@y.com')] }).estaCompleto()).toBe(false);
  });

  it('los getters devuelven copias (doble encapsulamiento)', () => {
    const correo = new CorreoElectronico('C1', { remitente: contacto('a@b.com'), destinatarios: [contacto('x@y.com')], fecha });
    correo.getDestinatarios().push(contacto('otro@y.com'));
    correo.getFecha().setFullYear(1990);
    expect(correo.getEmailsDestinatarios()).toEqual(['x@y.com']);
    expect(correo.getFecha()).toEqual(fecha);
  });

  it('eliminación lógica y restauración a su bandeja de origen (RF06)', () => {
    const correo = new CorreoElectronico('C1', { remitente: contacto('a@b.com') });
    correo.marcarEliminado(TipoBandeja.ENTRADA);
    expect(correo.estaEliminado()).toBe(true);
    expect(() => correo.marcarEliminado(TipoBandeja.ENTRADA)).toThrow();
    expect(() => correo.restaurar(TipoBandeja.ENVIADOS)).toThrow();
    correo.restaurar(TipoBandeja.ENTRADA);
    expect(correo.estaEliminado()).toBe(false);
  });
    it('se marca como leído y no leído (RF08)', () => {
    const correo = new CorreoElectronico('C1', { remitente: contacto('a@b.com') });
    expect(correo.estaLeido()).toBe(false);
    correo.marcarLeido();
    expect(correo.estaLeido()).toBe(true);
    correo.marcarNoLeido();
    expect(correo.estaLeido()).toBe(false);
  });

  it('se marca y desmarca como favorito (RF09)', () => {
    const correo = new CorreoElectronico('C1', { remitente: contacto('a@b.com') });
    correo.marcarFavorito();
    expect(correo.esFavorito()).toBe(true);
    correo.quitarFavorito();
    expect(correo.esFavorito()).toBe(false);
  });

    it('se edita validando con los mismos set (RF07)', () => {
    const correo = new CorreoElectronico('C1', { remitente: contacto('a@b.com') });
    correo.cambiarDestinatarios([contacto('x@y.com')]);
    correo.cambiarAsunto(' Nuevo asunto ');
    correo.cambiarCuerpo('Texto');
    expect(correo.getEmailsDestinatarios()).toEqual(['x@y.com']);
    expect(correo.getAsunto()).toBe('Nuevo asunto');
    expect(correo.getCuerpo()).toBe('Texto');
    expect(() => correo.cambiarDestinatarios([contacto('malo')])).toThrow();
  });
  
});