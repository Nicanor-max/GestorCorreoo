import { describe, it, expect, beforeEach } from 'vitest';
import { GestorBorradores } from '../Servicios/GestorBorradores';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';

describe('GestorBorradores', () => {
  let gestor: GestorBandejas;
  let borradores: GestorBorradores;

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    borradores = new GestorBorradores(gestor);
    borradores.guardar(new CorreoElectronico('B1', { remitente: 'nicanor@ucp.edu.ar' }));
  });

  it('guarda un borrador incompleto (RF07)', () => {
    expect(borradores.listar().map((c) => c.getId())).toEqual(['B1']);
    expect(borradores.recuperar('B1').estaCompleto()).toBe(false);
  });

  it('edita solo los campos indicados', () => {
    borradores.editar('B1', { asunto: 'Avance', destinatarios: ['esteban@ucp.edu.ar'] });
    borradores.editar('B1', { cuerpo: 'Te paso el avance' });
    const borrador = borradores.recuperar('B1');
    expect(borrador.getAsunto()).toBe('Avance');
    expect(borrador.getDestinatarios()).toEqual(['esteban@ucp.edu.ar']);
    expect(borrador.getCuerpo()).toBe('Te paso el avance');
    expect(borrador.estaCompleto()).toBe(true);
  });

  it('valida los datos al editar', () => {
    expect(() => borradores.editar('B1', { destinatarios: ['malo'] })).toThrow();
  });

  it('no edita correos que no son borradores', () => {
    gestor.agregar(new CorreoElectronico('C1', { remitente: 'a@b.com', destinatarios: ['x@y.com'], asunto: 'Hola' }), TipoBandeja.ENTRADA);
    expect(() => borradores.editar('C1', { asunto: 'Otro' })).toThrow('no es un borrador');
    expect(() => borradores.recuperar('NO-EXISTE')).toThrow();
  });

  it('un borrador eliminado se recupera y se puede seguir editando', () => {
    gestor.eliminar('B1');
    expect(() => borradores.editar('B1', { asunto: 'X' })).toThrow();
    gestor.restaurar('B1');
    borradores.editar('B1', { asunto: 'Recuperado' });
    expect(borradores.recuperar('B1').getAsunto()).toBe('Recuperado');
  });
});