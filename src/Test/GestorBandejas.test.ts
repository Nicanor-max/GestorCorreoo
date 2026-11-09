import { describe, it, expect, beforeEach } from 'vitest';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { BandejaEntrada } from '../Bandejas/BandejaEntrada';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';

const completo = (id: string) =>
  new CorreoElectronico(id, { remitente: 'a@b.com', destinatarios: ['x@y.com'], asunto: 'Hola' });

describe('GestorBandejas', () => {
  let gestor: GestorBandejas;

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
  });

  it('exige las cuatro bandejas sin repetir', () => {
    expect(() => new GestorBandejas([new BandejaEntrada()])).toThrow();
    expect(() => new GestorBandejas([...crearBandejas(), new BandejaEntrada()])).toThrow();
  });

  it('clasifica un correo en la bandeja indicada (RF06)', () => {
    gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
    expect(gestor.ubicacionDe('C1')).toBe(TipoBandeja.ENTRADA);
    expect(gestor.consultar(TipoBandeja.ENTRADA).cantidad()).toBe(1);
  });

  it('no deja agregar el mismo correo en dos bandejas', () => {
    gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
    expect(() => gestor.agregar(completo('C1'), TipoBandeja.ENVIADOS)).toThrow();
  });

  it('elimina lógicamente y restaura a la bandeja de origen (RF06)', () => {
    gestor.agregar(completo('C1'), TipoBandeja.ENVIADOS);
    gestor.eliminar('C1');
    expect(gestor.ubicacionDe('C1')).toBe(TipoBandeja.ELIMINADOS);
    expect(gestor.consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(0);
    gestor.restaurar('C1');
    expect(gestor.ubicacionDe('C1')).toBe(TipoBandeja.ENVIADOS);
    expect(gestor.consultar(TipoBandeja.ELIMINADOS).cantidad()).toBe(0);
  });

  it('respeta las reglas de movimiento entre bandejas', () => {
    gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
    expect(() => gestor.mover('C1', TipoBandeja.ENVIADOS)).toThrow();
    gestor.eliminar('C1');
    expect(() => gestor.mover('C1', TipoBandeja.BORRADORES)).toThrow();
    expect(gestor.ubicacionDe('C1')).toBe(TipoBandeja.ELIMINADOS);
  });

  it('falla con correos que no existen', () => {
    expect(() => gestor.eliminar('X')).toThrow();
    expect(() => gestor.restaurar('X')).toThrow();
    expect(gestor.ubicacionDe('X')).toBeNull();
  });
});