import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../Contactos/Contacto';
import { CorreoElectronico } from '../Correo/CorreoElectronico';
import { GestorBandejas } from '../Bandejas/GestorBandejas';
import { crearBandejas } from '../Bandejas/FabricaBandeja';
import { TipoBandeja } from '../TipoBandeja';
import { GestorFiltros } from '../Filtros/GestorFiltros';
import { GestorFavoritos } from '../Servicios/GestorFavoritos';
import { FiltroPersonalizado } from '../Filtros/FiltroPersonalizado';
import { crearFiltrosEjemplo } from '../Filtros/FabricaFiltros';
import { asuntoContiene, esLeido, no, o, remitenteDelDominio, y } from '../Filtros/Predicado';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// RF-05: filtros personalizados con predicados, lambdas y funciones de orden superior
describe('RF-05 Filtros personalizados', () => {
  const yo = new Contacto('Nicanor Pujol', 'nicanor@ucp.edu.ar');
  const profe = new Contacto('Profesor UCP', 'profe@ucp.edu.ar');
  const amigo = new Contacto('Juan Amigo', 'juan@gmail.com');

  let gestor: GestorBandejas;
  let filtros: GestorFiltros;
  let favoritos: GestorFavoritos;

  const ids = (correos: ICorreoConsulta[]): string[] => correos.map((c) => c.getId());
  const recibir = (id: string, de: Contacto, asunto: string, cuerpo: string): void =>
    gestor.agregar(new CorreoElectronico(id, { remitente: de, destinatarios: [yo], asunto, cuerpo, fecha: new Date('2026-11-10T10:00:00') }), TipoBandeja.ENTRADA);

  beforeEach(() => {
    gestor = new GestorBandejas(crearBandejas());
    filtros = new GestorFiltros(gestor);
    favoritos = new GestorFavoritos(gestor, gestor);
    recibir('E1', profe, 'Fecha de Examen final', 'Rinden el lunes');
    recibir('E2', profe, 'Entrega del Proyecto', 'Recuerden la Entrega del viernes');
    recibir('E3', amigo, 'Reunión del sábado', 'Asado en casa');
    recibir('E4', amigo, 'Examen de manejo', 'Me fue bien');
    crearFiltrosEjemplo('juan@gmail.com').forEach((f) => filtros.registrar(f));
  });

  it('1. filtro simple: correos de la UCP', () => {
    expect(ids(filtros.aplicarEn('Correos de la UCP', TipoBandeja.ENTRADA))).toEqual(['E1', 'E2']);
  });

  it('2. filtro complejo AND: de la UCP y con "Examen" en el asunto', () => {
    // E4 tiene "Examen" pero no es de la UCP
    expect(ids(filtros.aplicarEn('Académicos importantes', TipoBandeja.ENTRADA))).toEqual(['E1']);
  });

  it('3. filtro complejo AND + NOT: no leídos con "Entrega" en el cuerpo', () => {
    expect(ids(filtros.aplicarEn('Pendientes de revisión', TipoBandeja.ENTRADA))).toEqual(['E2']);
  });

  it('4. filtro complejo OR + AND + NOT: "Proyecto" o "Reunión" y no leído', () => {
    expect(ids(filtros.aplicarEn('Para seguimiento', TipoBandeja.ENTRADA))).toEqual(['E2', 'E3']);
  });

  it('5. los filtros son dinámicos: si cambia el correo, cambia el resultado sin volver a guardar nada', () => {
    gestor.obtenerCorreo('E2').marcarLeido();
    expect(ids(filtros.aplicarEn('Para seguimiento', TipoBandeja.ENTRADA))).toEqual(['E3']);
    expect(filtros.aplicarEn('Pendientes de revisión', TipoBandeja.ENTRADA)).toEqual([]);

    gestor.obtenerCorreo('E2').marcarNoLeido();
    expect(ids(filtros.aplicarEn('Para seguimiento', TipoBandeja.ENTRADA))).toEqual(['E2', 'E3']);
  });

  it('6. RF-09: combinar filtros dentro de favoritos', () => {
    favoritos.marcar('E3');
    favoritos.marcar('E1');
    expect(ids(filtros.aplicar('Personales prioritarios', favoritos.vista()))).toEqual(['E3']);
    expect(ids(filtros.aplicar('Correos de la UCP', favoritos.vista()))).toEqual(['E1']);
  });

  it('7. el mismo filtro se aplica sobre distintas bandejas y colecciones', () => {
    gestor.agregar(new CorreoElectronico('S1', { remitente: yo, destinatarios: [profe], asunto: 'Consulta' }), TipoBandeja.ENVIADOS);
    gestor.eliminar('E1');

    expect(ids(filtros.aplicarEn('Correos de la UCP', TipoBandeja.ENTRADA))).toEqual(['E2']);
    expect(ids(filtros.aplicarEn('Correos de la UCP', TipoBandeja.ENVIADOS))).toEqual(['S1']);
    expect(ids(filtros.aplicarEn('Correos de la UCP', TipoBandeja.ELIMINADOS))).toEqual(['E1']);
    expect(ids(filtros.aplicarEnActivos('Correos de la UCP'))).toContain('S1');
    expect(filtros.aplicarEn('Correos de la UCP', TipoBandeja.BORRADORES)).toEqual([]);
  });

  it('8. reutilizar predicados y filtros existentes para armar uno nuevo', () => {
    const deLaUcp = filtros.obtener('Correos de la UCP').getPredicado();
    const noUcpConExamen = new FiltroPersonalizado('Exámenes de afuera', y([no(deLaUcp), asuntoContiene('examen')]));

    expect(ids(noUcpConExamen.aplicar(gestor.listarDe(TipoBandeja.ENTRADA)))).toEqual(['E4']);
    // y el mismo filtro se puede volver a usar en otra consulta
    expect(noUcpConExamen.cumple(gestor.obtenerCorreo('E1'))).toBe(false);
  });

  it('9. AND, OR y NOT evalúan bien', () => {
    const correo = gestor.obtenerCorreo('E1');
    const verdadero = remitenteDelDominio('@ucp.edu.ar');
    const falso = asuntoContiene('no existe');

    expect(y([verdadero, falso])(correo)).toBe(false);
    expect(y([verdadero, verdadero])(correo)).toBe(true);
    expect(o([verdadero, falso])(correo)).toBe(true);
    expect(o([falso, falso])(correo)).toBe(false);
    expect(no(falso)(correo)).toBe(true);
    expect(no(esLeido())(correo)).toBe(true);
  });

  it('10. no se pueden registrar más de 5 filtros ni repetir nombre', () => {
    expect(filtros.cantidad()).toBe(5);
    expect(() => filtros.registrar(new FiltroPersonalizado('Sexto', esLeido()))).toThrow('más de 5 filtros');

    filtros.eliminar('Para seguimiento');
    expect(() => filtros.registrar(new FiltroPersonalizado('Correos de la UCP', esLeido()))).toThrow('Ya existe un filtro');
    filtros.registrar(new FiltroPersonalizado('Leídos', esLeido()));
    expect(filtros.listar().map((f) => f.getNombre())).toContain('Leídos');
  });

  it('11. aplicar filtros no modifica los correos originales', () => {
    const antes = gestor.listarDe(TipoBandeja.ENTRADA).map((c) => c.obtenerDatos());
    filtros.listar().forEach((f) => filtros.aplicarEn(f.getNombre(), TipoBandeja.ENTRADA));
    const despues = gestor.listarDe(TipoBandeja.ENTRADA).map((c) => c.obtenerDatos());

    expect(despues).toEqual(antes);
    expect(gestor.consultar(TipoBandeja.ENTRADA).cantidad()).toBe(4);
  });

  it('12. validaciones: filtro sin nombre y filtro inexistente', () => {
    expect(() => new FiltroPersonalizado('   ', esLeido())).toThrow('necesita un nombre');
    expect(() => filtros.obtener('No existe')).toThrow('No existe un filtro');
    expect(filtros.eliminar('No existe')).toBe(false);
  });
});