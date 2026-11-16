import { describe, it, expect, beforeEach } from 'vitest';
import { TipoBandeja } from '../TipoBandeja';
import { ServidorCorreo } from '../Usuarios/ServidorCorreo';
import { crearUsuario } from '../Usuarios/FabricaUsuarios';
import { IUsuario } from '../Interfaces/IUsuarios';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';

// Flujo multiusuario: Nicanor envía un correo a 3 personas, a cada una le llega a SU Entrada,
// uno lo guarda en favoritos y otro lo elimina. Lo que hace cada uno no le afecta a los demás.
describe('Envío a 3 usuarios: favoritos y eliminación por usuario', () => {
  let servidor: ServidorCorreo;
  let nicanor: IUsuario;
  let esteban: IUsuario;
  let profe: IUsuario;
  let laura: IUsuario;
  let id: string;

  // ids de una lista de correos
  const ids = (correos: ICorreoConsulta[]): string[] => correos.map((c) => c.getId());

  beforeEach(() => {
    // 1. se crean y registran los 4 usuarios, cada uno con sus propias bandejas
    servidor = new ServidorCorreo();
    nicanor = crearUsuario('Nicanor Pujol', 'nicanor@ucp.edu.ar');
    esteban = crearUsuario('Esteban Panigua', 'esteban@ucp.edu.ar');
    profe = crearUsuario('Profesor UCP', 'profe@ucp.edu.ar');
    laura = crearUsuario('Laura Gómez', 'laura@ucp.edu.ar');
    [nicanor, esteban, profe, laura].forEach((u) => servidor.registrar(u));

    // 2. Nicanor agenda a los 3 y les envía un correo
    nicanor.getAgenda().registrar('Esteban Panigua', 'esteban@ucp.edu.ar');
    nicanor.getAgenda().registrar('Profesor UCP', 'profe@ucp.edu.ar');
    nicanor.getAgenda().registrar('Laura Gómez', 'laura@ucp.edu.ar');
    id = servidor.enviarAContactos(
      'nicanor@ucp.edu.ar',
      ['esteban@ucp.edu.ar', 'profe@ucp.edu.ar', 'laura@ucp.edu.ar'],
      'Entrega del Sprint 3',
      'Les paso el avance del gestor de correos',
    );
  });

  it('1. el correo queda en Enviados de Nicanor con los 3 destinatarios', () => {
    expect(nicanor.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENVIADOS);
    const enviado = nicanor.getBandejas().obtenerCorreo(id);
    expect(enviado.getEmailsDestinatarios()).toEqual(['esteban@ucp.edu.ar', 'profe@ucp.edu.ar', 'laura@ucp.edu.ar']);
    expect(enviado.estaLeido()).toBe(true);
  });

  it('2. a cada uno de los 3 le llega a SU bandeja de Entrada, sin leer', () => {
    [esteban, profe, laura].forEach((u) => {
      expect(u.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
      expect(u.getBandejas().obtenerCorreo(id).getAsunto()).toBe('Entrega del Sprint 3');
      expect(u.getBandejas().obtenerCorreo(id).getEmailRemitente()).toBe('nicanor@ucp.edu.ar');
      expect(u.getLectura().contarNoLeidos(TipoBandeja.ENTRADA)).toBe(1);
    });
    // al remitente no le llega a su Entrada
    expect(nicanor.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(0);
  });

  it('3. Esteban lo guarda en favoritos: solo aparece en SUS favoritos', () => {
    esteban.getFavoritos().marcar(id);

    expect(ids(esteban.getFavoritos().vista())).toEqual([id]);
    expect(esteban.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA); // no se mueve de bandeja
    expect(profe.getFavoritos().vista()).toEqual([]);
    expect(laura.getFavoritos().vista()).toEqual([]);
    expect(nicanor.getFavoritos().vista()).toEqual([]);
  });

  it('4. Laura lo elimina: aparece en SU bandeja de Eliminados y a los demás no se les borra', () => {
    laura.getBandejas().eliminar(id);

    expect(laura.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ELIMINADOS);
    expect(ids(laura.getBandejas().consultar(TipoBandeja.ELIMINADOS).listar())).toEqual([id]);
    expect(laura.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(0);
    // recuerda que venía de su Entrada
    expect(laura.getBandejas().obtenerCorreo(id).getBandejaOrigen()).toBe(TipoBandeja.ENTRADA);

    expect(esteban.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
    expect(profe.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
    expect(nicanor.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENVIADOS);
  });

  it('5. favorito de uno y eliminado de otro al mismo tiempo, sin pisarse', () => {
    esteban.getFavoritos().marcar(id);
    laura.getBandejas().eliminar(id);

    expect(ids(esteban.getFavoritos().vista())).toEqual([id]);
    expect(esteban.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
    expect(laura.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ELIMINADOS);
    expect(laura.getBandejas().obtenerCorreo(id).esFavorito()).toBe(false);
  });

  it('6. Laura lo restaura: vuelve a SU Entrada y su papelera queda vacía', () => {
    laura.getBandejas().eliminar(id);
    laura.getBandejas().restaurar(id);

    expect(laura.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA);
    expect(laura.getBandejas().consultar(TipoBandeja.ELIMINADOS).cantidad()).toBe(0);
  });

  it('7. si el Profe marca favorito y después lo elimina, sale de su vista pero conserva la estrella (RF-09)', () => {
    profe.getFavoritos().marcar(id);
    profe.getBandejas().eliminar(id);

    expect(profe.getFavoritos().vista()).toEqual([]);
    expect(profe.getBandejas().obtenerCorreo(id).esFavorito()).toBe(true);

    profe.getBandejas().restaurar(id);
    expect(ids(profe.getFavoritos().vista())).toEqual([id]);
  });

  it('8. si Nicanor borra su enviado, va a SU papelera y los 3 lo siguen teniendo', () => {
    nicanor.getBandejas().eliminar(id);

    expect(nicanor.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ELIMINADOS);
    expect(nicanor.getBandejas().obtenerCorreo(id).getBandejaOrigen()).toBe(TipoBandeja.ENVIADOS);
    [esteban, profe, laura].forEach((u) => expect(u.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENTRADA));
  });

  it('9. un correo eliminado no se puede eliminar de nuevo ni mandar a una bandeja que no es la suya', () => {
    laura.getBandejas().eliminar(id);

    expect(() => laura.getBandejas().eliminar(id)).toThrow();
    // venía de Entrada: no se puede mandar a Enviados ni a Borradores
    expect(() => laura.getBandejas().mover(id, TipoBandeja.ENVIADOS)).toThrow();
    expect(() => laura.getBandejas().mover(id, TipoBandeja.BORRADORES)).toThrow();
    expect(laura.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ELIMINADOS);
  });

  it('10. cada uno lo encuentra con SU buscador, y Laura ya no lo ve en Entrada tras borrarlo', () => {
    laura.getBandejas().eliminar(id);

    expect(ids(esteban.getBuscador().buscar('sprint 3'))).toEqual([id]);
    expect(ids(profe.getBuscador().buscar('nicanor'))).toEqual([id]);
    expect(laura.getBuscador().buscar('sprint 3')).toEqual([]);
    expect(ids(laura.getBuscador().buscarEn(TipoBandeja.ELIMINADOS, 'sprint 3'))).toEqual([id]);
  });

  it('11. los destinatarios del correo no se pueden modificar desde afuera', () => {
    const correo = esteban.getBandejas().obtenerCorreo(id);
    correo.getDestinatarios().pop();
    expect(correo.getDestinatarios().length).toBe(3);
  });
});