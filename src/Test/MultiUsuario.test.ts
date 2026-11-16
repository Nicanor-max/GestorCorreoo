import { describe, it, expect, beforeEach } from 'vitest';
import { TipoBandeja } from '../TipoBandeja';
import { ServidorCorreo } from '../Usuarios/ServidorCorreo';
import { crearUsuario } from '../Usuarios/FabricaUsuarios';
import { IUsuario } from '../Interfaces/IUsuarios';
import { FiltroPersonalizado } from '../Filtros/FiltroPersonalizado';
import { remitenteDelDominio } from '../Filtros/Predicado';

// Cada usuario tiene sus propias bandejas: lo que hace uno no le afecta al otro
describe('Multiusuario: cada usuario con sus propias bandejas', () => {
  let servidor: ServidorCorreo;
  let nicanor: IUsuario;
  let esteban: IUsuario;
  let profe: IUsuario;
  let idC1: string;

  beforeEach(() => {
    servidor = new ServidorCorreo();
    nicanor = crearUsuario('Nicanor Pujol', 'nicanor@ucp.edu.ar');
    esteban = crearUsuario('Esteban Panigua', 'esteban@ucp.edu.ar');
    profe = crearUsuario('Profesor UCP', 'profe@ucp.edu.ar');
    servidor.registrar(nicanor);
    servidor.registrar(esteban);
    servidor.registrar(profe);

    // Nicanor le manda un correo a 2 personas
    idC1 = servidor.enviar('nicanor@ucp.edu.ar', {
      destinatarios: [esteban.getContacto(), profe.getContacto()],
      asunto: 'Entrega del Sprint 3',
      cuerpo: 'Les paso el avance',
    });
  });

  it('1. un envío llega a varias bandejas: Enviados del remitente y Entrada de cada destinatario', () => {
    expect(nicanor.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENVIADOS);
    expect(esteban.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENTRADA);
    expect(profe.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENTRADA);
    expect(esteban.getBandejas().obtenerCorreo(idC1).getEmailRemitente()).toBe('nicanor@ucp.edu.ar');
    // el remitente no lo recibe en su Entrada
    expect(nicanor.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(0);
  });

  it('2. favoritos por usuario: si Esteban lo marca, a los demás no se les marca', () => {
    esteban.getFavoritos().marcar(idC1);

    expect(esteban.getFavoritos().vista().length).toBe(1);
    expect(profe.getFavoritos().vista().length).toBe(0);
    expect(nicanor.getFavoritos().vista().length).toBe(0);
    expect(profe.getBandejas().obtenerCorreo(idC1).esFavorito()).toBe(false);
  });

  it('3. eliminar por usuario: si Esteban lo borra, al Profe y a Nicanor no se les borra', () => {
    esteban.getBandejas().eliminar(idC1);

    expect(esteban.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ELIMINADOS);
    expect(profe.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENTRADA);
    expect(nicanor.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENVIADOS);

    // y lo puede restaurar a SU Entrada
    esteban.getBandejas().restaurar(idC1);
    expect(esteban.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENTRADA);
  });

  it('4. si el remitente borra su enviado, los destinatarios lo siguen teniendo', () => {
    nicanor.getBandejas().eliminar(idC1);

    expect(nicanor.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ELIMINADOS);
    expect(esteban.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENTRADA);
    expect(profe.getBandejas().ubicacionDe(idC1)).toBe(TipoBandeja.ENTRADA);
  });

  it('5. leídos por usuario: llega sin leer y cada uno lo lee por su cuenta', () => {
    expect(nicanor.getBandejas().obtenerCorreo(idC1).estaLeido()).toBe(true);
    expect(esteban.getLectura().contarNoLeidos(TipoBandeja.ENTRADA)).toBe(1);

    esteban.getLectura().marcarLeido(idC1);
    expect(esteban.getLectura().contarNoLeidos(TipoBandeja.ENTRADA)).toBe(0);
    expect(profe.getLectura().contarNoLeidos(TipoBandeja.ENTRADA)).toBe(1);
  });

  it('6. borradores por usuario: solo los ve quien los escribe y al enviarlos se reparten', () => {
    const idB = servidor.redactar('esteban@ucp.edu.ar', { asunto: 'Reunión' });
    expect(esteban.getBorradores().listar().length).toBe(1);
    expect(nicanor.getBorradores().listar().length).toBe(0);
    expect(() => servidor.enviarBorrador('esteban@ucp.edu.ar', idB)).toThrow('no tiene destinatarios');

    esteban.getBorradores().editar(idB, { destinatarios: [nicanor.getContacto(), profe.getContacto()] });
    expect(servidor.enviarBorrador('esteban@ucp.edu.ar', idB)).toEqual(['nicanor@ucp.edu.ar', 'profe@ucp.edu.ar']);

    expect(esteban.getBorradores().listar().length).toBe(0);
    expect(esteban.getBandejas().ubicacionDe(idB)).toBe(TipoBandeja.ENVIADOS);
    expect(nicanor.getBandejas().ubicacionDe(idB)).toBe(TipoBandeja.ENTRADA);
    expect(profe.getBandejas().ubicacionDe(idB)).toBe(TipoBandeja.ENTRADA);
  });

  it('7. la búsqueda de cada usuario busca solo en sus bandejas', () => {
    expect(esteban.getBuscador().buscar('Sprint 3').length).toBe(1);
    expect(nicanor.getBuscador().buscar('Sprint 3').length).toBe(0); // su Entrada está vacía
    expect(nicanor.getBuscador().buscarEn(TipoBandeja.ENVIADOS, 'Sprint 3').length).toBe(1);
  });

  it('8. respuestas: el Profe le contesta a Nicanor y los ids nunca se repiten', () => {
    const idR = servidor.enviar('profe@ucp.edu.ar', { destinatarios: [nicanor.getContacto()], asunto: 'Re: Entrega del Sprint 3' });

    expect(idR).not.toBe(idC1);
    expect(profe.getBandejas().ubicacionDe(idR)).toBe(TipoBandeja.ENVIADOS);
    expect(nicanor.getBandejas().ubicacionDe(idR)).toBe(TipoBandeja.ENTRADA);
    expect(esteban.getBandejas().ubicacionDe(idR)).toBe(null);
  });

  it('9. validaciones: usuario repetido o inexistente, correo inválido y destinatario sin cuenta', () => {
    expect(() => servidor.registrar(crearUsuario('Otro', 'NICANOR@ucp.edu.ar'))).toThrow('Ya existe un usuario');
    expect(() => servidor.obtenerUsuario('nadie@ucp.edu.ar')).toThrow('No existe un usuario');
    expect(() => servidor.enviar('nadie@ucp.edu.ar', { asunto: 'Hola' })).toThrow('No existe un usuario');

    // un correo sin asunto no queda en ningún buzón
    expect(() => servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: [esteban.getContacto()], asunto: '' }))
      .toThrow('no tiene asunto');
    expect(nicanor.getBandejas().consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(1);
    expect(esteban.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(1);

    // un destinatario de afuera no rompe el envío: se entrega solo a los que tienen cuenta
    const externo = crearUsuario('Alguien', 'alguien@gmail.com').getContacto();
    const idX = servidor.redactar('nicanor@ucp.edu.ar', { destinatarios: [esteban.getContacto(), externo], asunto: 'Aviso' });
    expect(servidor.enviarBorrador('nicanor@ucp.edu.ar', idX)).toEqual(['esteban@ucp.edu.ar']);
  });

  it('10. el usuario está encapsulado: su contacto se devuelve como copia', () => {
    expect(nicanor.getNombre()).toBe('Nicanor Pujol');
    expect(nicanor.getEmail()).toBe('nicanor@ucp.edu.ar');
    expect(servidor.obtenerUsuario('NICANOR@ucp.edu.ar')).toBe(nicanor);
  });

  it('11. agenda por usuario: cada uno tiene la suya y no ve la de los demás', () => {
    nicanor.getAgenda().registrar('Esteban Panigua', 'esteban@ucp.edu.ar');
    nicanor.getAgenda().registrar('Profesor UCP', 'profe@ucp.edu.ar');
    esteban.getAgenda().registrar('Nicanor Pujol', 'nicanor@ucp.edu.ar');

    expect(nicanor.getAgenda().cantidad()).toBe(2);
    expect(esteban.getAgenda().cantidad()).toBe(1);
    expect(profe.getAgenda().cantidad()).toBe(0);
    expect(esteban.getAgenda().buscarPorEmail('profe@ucp.edu.ar')).toBe(null);

    // si Nicanor modifica un contacto, la agenda de Esteban no cambia
    nicanor.getAgenda().modificarNombre('esteban@ucp.edu.ar', 'Esteban A. Panigua');
    expect(esteban.getAgenda().listar()[0].getNombre()).toBe('Nicanor Pujol');
    expect(() => nicanor.getAgenda().registrar('Repetido', 'ESTEBAN@ucp.edu.ar')).toThrow('Ya existe un contacto');
  });

  it('12. enviar a contactos de la propia agenda: solo a gente agendada', () => {
    nicanor.getAgenda().registrar('Esteban Panigua', 'esteban@ucp.edu.ar');
    nicanor.getAgenda().registrar('Profesor UCP', 'profe@ucp.edu.ar');

    const id = servidor.enviarAContactos('nicanor@ucp.edu.ar', ['esteban@ucp.edu.ar', 'profe@ucp.edu.ar'], 'Consulta', 'Hola a todos');
    expect(nicanor.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENVIADOS);
    expect(esteban.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
    expect(profe.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);

    // Esteban no tiene al Profe agendado
    expect(() => servidor.enviarAContactos('esteban@ucp.edu.ar', ['profe@ucp.edu.ar'], 'Hola', ''))
      .toThrow('no está en la agenda');
  });

  it('13. borrar o editar un contacto de la agenda no toca los correos históricos', () => {
    nicanor.getAgenda().registrar('Esteban Panigua', 'esteban@ucp.edu.ar');
    const id = servidor.enviarAContactos('nicanor@ucp.edu.ar', ['esteban@ucp.edu.ar'], 'Histórico', '');

    nicanor.getAgenda().modificarNombre('esteban@ucp.edu.ar', 'Otro nombre');
    nicanor.getAgenda().eliminar('esteban@ucp.edu.ar');

    expect(nicanor.getAgenda().cantidad()).toBe(0);
    const enviado = nicanor.getBandejas().obtenerCorreo(id);
    expect(enviado.getDestinatarios()[0].getNombre()).toBe('Esteban Panigua');
    expect(esteban.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
  });

  it('14. filtros por usuario: cada uno registra los suyos y los aplica sobre sus bandejas', () => {
    esteban.getFiltros().registrar(new FiltroPersonalizado('De la UCP', remitenteDelDominio('@ucp.edu.ar')));

    expect(esteban.getFiltros().cantidad()).toBe(1);
    expect(profe.getFiltros().cantidad()).toBe(0);
    expect(esteban.getFiltros().aplicarEn('De la UCP', TipoBandeja.ENTRADA).map((c) => c.getId())).toEqual([idC1]);
    expect(() => profe.getFiltros().obtener('De la UCP')).toThrow('No existe un filtro');
  });

  it('15. estadísticas por usuario: cada uno ve los números de sus bandejas', () => {
    servidor.enviar('profe@ucp.edu.ar', { destinatarios: [esteban.getContacto()], asunto: 'Notas' });

    expect(esteban.getEstadisticas().asuntosDe(TipoBandeja.ENTRADA)).toContain('Notas');
    expect(esteban.getEstadisticas().cantidadPorBandeja().get(TipoBandeja.ENTRADA)).toBe(2);
    expect(nicanor.getEstadisticas().cantidadPorBandeja().get(TipoBandeja.ENTRADA)).toBe(0);
    expect(nicanor.getEstadisticas().totalDestinatarios(TipoBandeja.ENVIADOS)).toBe(2);
    expect(esteban.getEstadisticas().correosPorRemitente(TipoBandeja.ENTRADA).get('profe@ucp.edu.ar')).toBe(1);
  });
});