import { describe, it, expect } from 'vitest';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { TipoBandeja } from '../TipoBandeja';

const fecha = new Date('2026-11-02T10:00:00');

describe('CorreoElectronico', () => {
  it('se crea con sus atributos (RF01)', () => {
    const correo = new CorreoElectronico('C1', {
      remitente: 'Nicanor@ucp.edu.ar',
      destinatarios: ['esteban@ucp.edu.ar'],
      asunto: ' Sprint 1 ',
      cuerpo: 'Hola',
      fecha,
    });
        expect(correo.obtenerDatos()).toEqual({
      id: 'C1',
      remitente: 'nicanor@ucp.edu.ar',
      destinatarios: ['esteban@ucp.edu.ar'],
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

  it('valida id, remitente y destinatarios', () => {
    expect(() => new CorreoElectronico('', { remitente: 'a@b.com' })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: 'malo' })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: 'a@b.com', destinatarios: ['malo'] })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: 'a@b.com', destinatarios: ['x@y.com', 'X@y.com'] })).toThrow();
    expect(() => new CorreoElectronico('C1', { remitente: 'a@b.com', fecha: new Date('nada') })).toThrow();
  });

  it('sin destinatarios o sin asunto queda incompleto', () => {
    expect(new CorreoElectronico('C1', { remitente: 'a@b.com', asunto: 'Hola' }).estaCompleto()).toBe(false);
    expect(new CorreoElectronico('C2', { remitente: 'a@b.com', destinatarios: ['x@y.com'] }).estaCompleto()).toBe(false);
  });

  it('los getters devuelven copias (doble encapsulamiento)', () => {
    const correo = new CorreoElectronico('C1', { remitente: 'a@b.com', destinatarios: ['x@y.com'], fecha });
    correo.getDestinatarios().push('otro@y.com');
    correo.getFecha().setFullYear(1990);
    expect(correo.getDestinatarios()).toEqual(['x@y.com']);
    expect(correo.getFecha()).toEqual(fecha);
  });

  it('eliminación lógica y restauración a su bandeja de origen (RF06)', () => {
    const correo = new CorreoElectronico('C1', { remitente: 'a@b.com' });
    correo.marcarEliminado(TipoBandeja.ENTRADA);
    expect(correo.estaEliminado()).toBe(true);
    expect(() => correo.marcarEliminado(TipoBandeja.ENTRADA)).toThrow();
    expect(() => correo.restaurar(TipoBandeja.ENVIADOS)).toThrow();
    correo.restaurar(TipoBandeja.ENTRADA);
    expect(correo.estaEliminado()).toBe(false);
  });
    it('se marca como leído y no leído (RF08)', () => {
    const correo = new CorreoElectronico('C1', { remitente: 'a@b.com' });
    expect(correo.estaLeido()).toBe(false);
    correo.marcarLeido();
    expect(correo.estaLeido()).toBe(true);
    correo.marcarNoLeido();
    expect(correo.estaLeido()).toBe(false);
  });

  it('se marca y desmarca como favorito (RF09)', () => {
    const correo = new CorreoElectronico('C1', { remitente: 'a@b.com' });
    correo.marcarFavorito();
    expect(correo.esFavorito()).toBe(true);
    correo.quitarFavorito();
    expect(correo.esFavorito()).toBe(false);
  });
});