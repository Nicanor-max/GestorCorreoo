import { describe, it, expect } from 'vitest';
import { Contacto } from '../Contactos/Contacto';

describe('Contacto', () => {
  it('se crea con nombre y email (RF03)', () => {
    const contacto = new Contacto('Esteban', 'esteban@ucp.edu.ar');
    expect(contacto.obtenerDatos()).toEqual({ nombre: 'Esteban', email: 'esteban@ucp.edu.ar' });
  });

  it('rechaza nombre vacío o email inválido', () => {
    expect(() => new Contacto('  ', 'esteban@ucp.edu.ar')).toThrow();
    expect(() => new Contacto('Esteban', 'esteban')).toThrow();
  });

  it('cambia nombre y email validando', () => {
    const contacto = new Contacto('Esteban', 'esteban@ucp.edu.ar');
    contacto.cambiarNombre('Esteban P.');
    contacto.cambiarEmail('epanigua@ucp.edu.ar');
    expect(contacto.obtenerDatos()).toEqual({ nombre: 'Esteban P.', email: 'epanigua@ucp.edu.ar' });
    expect(() => contacto.cambiarEmail('malo')).toThrow();
  });
});