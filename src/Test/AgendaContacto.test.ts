import { describe, it, expect, beforeEach } from 'vitest';
import { AgendaContactos } from '../Contactos/AgendaContacto';
import { IContactoConsulta } from '../Interfaces/IContactoConsulta';

describe('AgendaContactos', () => {
  let agenda: AgendaContactos;

  beforeEach(() => {
    agenda = new AgendaContactos();
    agenda.registrar('Nicanor', 'nicanor@ucp.edu.ar');
    agenda.registrar('Esteban', 'esteban@ucp.edu.ar');
  });

  it('registra y consulta contactos (RF03)', () => {
    expect(agenda.cantidad()).toBe(2);
    const esteban = agenda.buscarPorEmail('ESTEBAN@ucp.edu.ar') as IContactoConsulta;
    expect(esteban.getNombre()).toBe('Esteban');
    expect(agenda.buscarPorEmail('nadie@ucp.edu.ar')).toBeNull();
  });

  it('no permite emails duplicados', () => {
    expect(() => agenda.registrar('Otro', 'Nicanor@ucp.edu.ar')).toThrow();
  });

  it('modifica nombre y email', () => {
    agenda.modificarNombre('esteban@ucp.edu.ar', 'Esteban Panigua');
    agenda.modificarEmail('esteban@ucp.edu.ar', 'epanigua@ucp.edu.ar');
    const modificado = agenda.buscarPorEmail('epanigua@ucp.edu.ar') as IContactoConsulta;
    expect(modificado.getNombre()).toBe('Esteban Panigua');
    expect(agenda.buscarPorEmail('esteban@ucp.edu.ar')).toBeNull();
  });

  it('no deja cambiar el email a uno que ya existe', () => {
    expect(() => agenda.modificarEmail('esteban@ucp.edu.ar', 'nicanor@ucp.edu.ar')).toThrow();
  });

  it('falla al modificar un contacto que no existe', () => {
    expect(() => agenda.modificarNombre('nadie@ucp.edu.ar', 'X')).toThrow();
  });

  it('elimina contactos', () => {
    expect(agenda.eliminar('nicanor@ucp.edu.ar')).toBe(true);
    expect(agenda.eliminar('nicanor@ucp.edu.ar')).toBe(false);
    expect(agenda.cantidad()).toBe(1);
  });

  it('listar devuelve una copia (encapsulamiento)', () => {
    agenda.listar().pop();
    expect(agenda.cantidad()).toBe(2);
  });
});