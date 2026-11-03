import { describe, it, expect } from 'vitest';
import { DireccionEmail } from '../Comun/DirreccionEmail';

describe('DireccionEmail', () => {
  it('guarda la dirección normalizada en minúsculas y sin espacios', () => {
    expect(new DireccionEmail('  Nicanor@UCP.edu.ar ').getValor()).toBe('nicanor@ucp.edu.ar');
  });

  it('rechaza formatos inválidos', () => {
    expect(() => new DireccionEmail('')).toThrow();
    expect(() => new DireccionEmail('sinarroba.com')).toThrow();
    expect(() => new DireccionEmail('a@b')).toThrow();
    expect(() => new DireccionEmail('con espacio@ucp.edu.ar')).toThrow();
  });

  it('compara dos direcciones por su valor', () => {
    expect(new DireccionEmail('a@b.com').esIgualA(new DireccionEmail('A@B.com'))).toBe(true);
  });
});