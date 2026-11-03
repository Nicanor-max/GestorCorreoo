import { describe, it, expect } from 'vitest';
import { BandejaBase } from '../Bandejas/BandejaBase';
import { BandejaEntrada } from '../Bandejas/BandejaEntrada';
import { BandejaBorradores } from '../Bandejas/BandejaBorrador';
import { BandejaEliminados } from '../Bandejas/BandejaEliminados';
import { TipoBandeja } from '../tipobandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';

const completo = (id: string, fecha = new Date()) =>
  new CorreoElectronico(id, { remitente: 'a@b.com', destinatarios: ['x@y.com'], asunto: 'Hola', fecha });
const incompleto = (id: string) => new CorreoElectronico(id, { remitente: 'a@b.com' });

describe('Bandejas', () => {
  it('Entrada recibe correos completos nuevos (RF06)', () => {
    const entrada = new BandejaEntrada();
    entrada.recibir(completo('C1'), null);
    expect(entrada.contiene('C1')).toBe(true);
    expect(entrada.cantidad()).toBe(1);
  });

  it('Entrada rechaza correos incompletos y repetidos', () => {
    const entrada = new BandejaEntrada();
    expect(() => entrada.recibir(incompleto('C1'), null)).toThrow();
    entrada.recibir(completo('C2'), null);
    expect(() => entrada.recibir(completo('C2'), null)).toThrow();
  });

  it('Borradores acepta correos incompletos (polimorfismo)', () => {
    const borradores = new BandejaBorradores();
    borradores.recibir(incompleto('C1'), null);
    expect(borradores.contiene('C1')).toBe(true);
  });

  it('Eliminados no recibe correos nuevos y marca el origen', () => {
    const eliminados = new BandejaEliminados();
    const correo = completo('C1');
    expect(() => eliminados.recibir(correo, null)).toThrow();
    eliminados.recibir(correo, TipoBandeja.ENTRADA);
    expect(correo.getBandejaOrigen()).toBe(TipoBandeja.ENTRADA);
  });

  it('todas se usan igual a través de la clase base (polimorfismo)', () => {
    const bandejas: BandejaBase[] = [new BandejaEntrada(), new BandejaBorradores()];
    bandejas.forEach((bandeja, i) => bandeja.recibir(completo(`C${i}`), null));
    expect(bandejas.map((b) => b.cantidad())).toEqual([1, 1]);
  });

  it('lista los correos del más reciente al más viejo', () => {
    const entrada = new BandejaEntrada();
    entrada.recibir(completo('viejo', new Date('2026-01-01')), null);
    entrada.recibir(completo('nuevo', new Date('2026-06-01')), null);
    expect(entrada.listar().map((c) => c.getId())).toEqual(['nuevo', 'viejo']);
  });

  it('quitar saca el correo y falla si no está', () => {
    const entrada = new BandejaEntrada();
    entrada.recibir(completo('C1'), null);
    expect(entrada.quitar('C1').getId()).toBe('C1');
    expect(entrada.buscarPorId('C1')).toBeNull();
    expect(() => entrada.quitar('C1')).toThrow();
  });
});

