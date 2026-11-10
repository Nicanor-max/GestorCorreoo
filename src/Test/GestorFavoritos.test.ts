import { describe, it, expect, beforeEach } from 'vitest';
import { GestorFavoritos } from '../Servicios/GestorFavoritos';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { contacto } from './Ayudante';

const completo = (id: string) =>
  new CorreoElectronico(id, { remitente: contacto('a@b.com'), destinatarios: [contacto('x@y.com')], asunto: 'Hola' });

describe('GestorFavoritos', () => {
  let gestor: GestorBandejas;
  let favoritos: GestorFavoritos;

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    favoritos = new GestorFavoritos(gestor, gestor);
    gestor.agregar(completo('C1'), TipoBandeja.ENTRADA);
    gestor.agregar(completo('C2'), TipoBandeja.ENVIADOS);
    gestor.agregar(completo('C3'), TipoBandeja.ENTRADA);
  });

  it('la vista muestra los favoritos de todas las bandejas (RF09)', () => {
    favoritos.marcar('C1');
    favoritos.marcar('C2');
    expect(favoritos.vista().map((c) => c.getId())).toEqual(['C1', 'C2']);
  });

  it('marcar un favorito no lo mueve de su bandeja', () => {
    favoritos.marcar('C1');
    expect(gestor.ubicacionDe('C1')).toBe(TipoBandeja.ENTRADA);
    expect(gestor.consultar(TipoBandeja.ENTRADA).cantidad()).toBe(2);
  });

  it('no genera duplicados al marcar dos veces', () => {
    favoritos.marcar('C1');
    favoritos.marcar('C1');
    expect(favoritos.vista().length).toBe(1);
  });

  it('quitar lo saca de la vista', () => {
    favoritos.marcar('C1');
    favoritos.quitar('C1');
    expect(favoritos.vista()).toEqual([]);
  });

  it('un favorito eliminado no aparece en la vista', () => {
    favoritos.marcar('C1');
    gestor.eliminar('C1');
    expect(favoritos.vista()).toEqual([]);
    gestor.restaurar('C1');
    expect(favoritos.vista().length).toBe(1);
  });
});