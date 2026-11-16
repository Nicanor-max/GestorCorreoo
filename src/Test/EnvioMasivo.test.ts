import { describe, it, expect, beforeEach } from 'vitest';
import { TipoBandeja } from '../TipoBandeja';
import { ServidorCorreo } from '../Usuarios/ServidorCorreo';
import { crearUsuario } from '../Usuarios/FabricaUsuarios';
import { IUsuario } from '../Interfaces/IUsuarios';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { BusquedaPorAsunto } from '../Busqueda/BusquedaPorAsunto';
import { BusquedaPorDestinatario } from '../Busqueda/BusquedaPorDestinatario';

// Pedido del profe, versión multiusuario: Nicanor le envía a 100 usuarios reales.
// A cada uno le llega a SU Entrada, se busca el número 57 y cada uno maneja su copia.
describe('Envío masivo a 100 usuarios y búsqueda del número 57 (pedido del profe)', () => {
  let servidor: ServidorCorreo;
  let nicanor: IUsuario;
  let personas: IUsuario[];

  const ids = (correos: ICorreoConsulta[]): string[] => correos.map((c) => c.getId());
  const persona = (numero: number): IUsuario => servidor.obtenerUsuario(`persona${numero}@ucp.edu.ar`);
  const contactosDeTodos = () => personas.map((p) => p.getContacto());
  // cuántas de las 100 personas tienen el correo en la bandeja indicada
  const cuantosTienen = (id: string, tipo: TipoBandeja): number =>
    personas.filter((p) => p.getBandejas().ubicacionDe(id) === tipo).length;

  beforeEach(() => {
    servidor = new ServidorCorreo();
    nicanor = crearUsuario('Nicanor Pujol', 'nicanor@ucp.edu.ar');
    servidor.registrar(nicanor);

    // 100 usuarios: Persona 1 (persona1@ucp.edu.ar) ... Persona 100
    personas = [];
    for (let i = 1; i <= 100; i++) {
      personas.push(crearUsuario(`Persona ${i}`, `persona${i}@ucp.edu.ar`));
    }
    personas.forEach((p) => servidor.registrar(p));
  });

  it('1. envía un correo a 100 personas desde un borrador (RF-02 y RF-07)', () => {
    const id = servidor.redactar('nicanor@ucp.edu.ar', { asunto: 'Aviso a todo el curso' });
    nicanor.getBorradores().editar(id, { destinatarios: contactosDeTodos(), cuerpo: 'Mañana no hay clase' });

    const entregados = servidor.enviarBorrador('nicanor@ucp.edu.ar', id);

    expect(entregados.length).toBe(100);
    expect(nicanor.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENVIADOS);
    expect(nicanor.getBorradores().listar()).toEqual([]); // dejó de estar en Borradores
    const enviado = nicanor.getBandejas().obtenerCorreo(id);
    expect(enviado.getDestinatarios().length).toBe(100);
    expect(enviado.getEmailsDestinatarios()[0]).toBe('persona1@ucp.edu.ar');
    expect(enviado.getEmailsDestinatarios()[99]).toBe('persona100@ucp.edu.ar');
  });

  it('2. a los 100 les llega a SU Entrada, sin leer, y al remitente no', () => {
    const id = servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: contactosDeTodos(), asunto: 'Aviso a todo el curso' });

    expect(cuantosTienen(id, TipoBandeja.ENTRADA)).toBe(100);
    const noLeidos = personas.reduce((total, p) => total + p.getLectura().contarNoLeidos(TipoBandeja.ENTRADA), 0);
    expect(noLeidos).toBe(100);
    expect(nicanor.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(0);
  });

  it('3. no deja enviar si un destinatario está repetido, y a nadie le llega nada', () => {
    const conRepetido = [...contactosDeTodos().filter((c, i) => i < 99), persona(1).getContacto()];

    expect(() => servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: conRepetido, asunto: 'Aviso' }))
      .toThrow('repetidos');
    expect(nicanor.getBandejas().consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(0);
    const recibidos = personas.reduce((total, p) => total + p.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad(), 0);
    expect(recibidos).toBe(0);
  });

  it('4. Nicanor encuentra a la persona 57 entre los 100 destinatarios (RF-04)', () => {
    const id = servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: contactosDeTodos(), asunto: 'Aviso a todo el curso' });
    const buscador = nicanor.getBuscador();

    expect(ids(buscador.buscarCon(new BusquedaPorDestinatario(), 'persona57@'))).toEqual([id]);
    expect(ids(buscador.buscarCon(new BusquedaPorDestinatario(), 'Persona 57'))).toEqual([id]);
    expect(buscador.buscarCon(new BusquedaPorDestinatario(), 'persona101@')).toEqual([]);
  });

  it('5. envía 100 correos numerados, busca el número 57 en Enviados y verifica que esté en la Entrada de la persona 57', () => {
    personas.forEach((p, i) => {
      servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: [p.getContacto()], asunto: `Correo número ${i + 1}` });
    });
    expect(nicanor.getBandejas().consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(100);

    // 1) busco el número 57 en la bandeja de ENVIADOS de Nicanor: aparece uno solo
    const encontrados = nicanor.getBuscador().buscarEn(TipoBandeja.ENVIADOS, 'número 57');
    expect(encontrados.length).toBe(1);
    const enviado = encontrados[0];
    expect(enviado.getAsunto()).toBe('Correo número 57');
    expect(nicanor.getBandejas().ubicacionDe(enviado.getId())).toBe(TipoBandeja.ENVIADOS);
    expect(enviado.getEmailsDestinatarios()).toEqual(['persona57@ucp.edu.ar']);
    // con el criterio de asunto da el mismo resultado
    expect(ids(nicanor.getBuscador().buscarCon(new BusquedaPorAsunto(), 'número 57'))).toEqual([enviado.getId()]);

    // 2) ese MISMO correo (mismo id) está en la bandeja de ENTRADA (recibidos) de la persona 57
    const p57 = persona(57);
    expect(p57.getBandejas().ubicacionDe(enviado.getId())).toBe(TipoBandeja.ENTRADA);
    const recibido = p57.getBandejas().obtenerCorreo(enviado.getId());
    expect(recibido.getAsunto()).toBe('Correo número 57');
    expect(recibido.getEmailRemitente()).toBe('nicanor@ucp.edu.ar');
    expect(recibido.estaLeido()).toBe(false);
    // y la persona 57 también lo encuentra buscando en SU Entrada
    expect(ids(p57.getBuscador().buscar('número 57'))).toEqual([enviado.getId()]);
    expect(p57.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(1);

    // 3) nadie más lo recibió: solo la persona 57 lo tiene en su Entrada
    expect(cuantosTienen(enviado.getId(), TipoBandeja.ENTRADA)).toBe(1);
    expect(persona(58).getBandejas().ubicacionDe(enviado.getId())).toBe(null);
    expect(persona(58).getBuscador().buscar('número 57')).toEqual([]);
  });

  it('6. cada persona maneja su copia: la 57 lo borra, la 12 lo marca favorito, y los demás no cambian', () => {
    const id = servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: contactosDeTodos(), asunto: 'Aviso a todo el curso' });

    persona(57).getBandejas().eliminar(id);
    persona(12).getFavoritos().marcar(id);

    expect(persona(57).getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ELIMINADOS);
    expect(cuantosTienen(id, TipoBandeja.ENTRADA)).toBe(99);
    expect(cuantosTienen(id, TipoBandeja.ELIMINADOS)).toBe(1);

    const conFavorito = personas.filter((p) => p.getFavoritos().vista().length > 0);
    expect(conFavorito.map((p) => p.getEmail())).toEqual(['persona12@ucp.edu.ar']);
    expect(nicanor.getBandejas().ubicacionDe(id)).toBe(TipoBandeja.ENVIADOS);
  });

  it('7. estadísticas del envío masivo (RF-10)', () => {
    servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: contactosDeTodos(), asunto: 'Aviso a todo el curso' });

    expect(nicanor.getEstadisticas().totalDestinatarios(TipoBandeja.ENVIADOS)).toBe(100);
    expect(nicanor.getEstadisticas().asuntosDe(TipoBandeja.ENVIADOS)).toEqual(['Aviso a todo el curso']);
    expect(persona(57).getEstadisticas().correosPorRemitente(TipoBandeja.ENTRADA).get('nicanor@ucp.edu.ar')).toBe(1);
  });
});