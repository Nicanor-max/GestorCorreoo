import { describe, it, expect, beforeEach } from 'vitest';
import { TipoBandeja } from '../TipoBandeja';
import { ServidorCorreo } from '../Usuarios/ServidorCorreo';
import { crearUsuario } from '../Usuarios/FabricaUsuarios';
import { IUsuario } from '../Interfaces/IUsuarios';
import { ICorreoConsulta } from '../Interfaces/ICorreoConsulta';
import { FiltroPersonalizado } from '../Filtros/FiltroPersonalizado';
import { asuntoContiene, esLeido, no, o, remitenteDelDominio, y } from '../Filtros/Predicado';

// Pedido del profe: envío a 100 personas con multiusuario, revisar las bandejas
// y después aplicar un filtro compuesto sobre las bandejas de cada usuario.
describe('Envío masivo a 100 usuarios + filtro compuesto', () => {
  let servidor: ServidorCorreo;
  let nicanor: IUsuario;
  let profe: IUsuario;
  let juan: IUsuario;
  let personas: IUsuario[];
  let idExamen: string;
  let idReunion: string;
  let idManejo: string;

  const ids = (correos: ICorreoConsulta[]): string[] => correos.map((c) => c.getId()).sort();
  const persona = (numero: number): IUsuario => servidor.obtenerUsuario(`persona${numero}@ucp.edu.ar`);
  const contactosDeTodos = () => personas.map((p) => p.getContacto());
  // cuántas de las 100 personas tienen el correo en la bandeja indicada
  const cuantosTienen = (id: string, tipo: TipoBandeja): number =>
    personas.filter((p) => p.getBandejas().ubicacionDe(id) === tipo).length;

  // FILTRO COMPUESTO: (asunto con "examen" O con "reunión") Y viene de la UCP Y NO está leído
  const pendientesDeLaUcp = (): FiltroPersonalizado =>
    new FiltroPersonalizado('Pendientes de la UCP', y([
      o([asuntoContiene('examen'), asuntoContiene('reunión')]),
      remitenteDelDominio('@ucp.edu.ar'),
      no(esLeido()),
    ]));

  beforeEach(() => {
    // 1. se registran 3 remitentes y 100 personas, cada uno con sus propias bandejas
    servidor = new ServidorCorreo();
    nicanor = crearUsuario('Nicanor Pujol', 'nicanor@ucp.edu.ar');
    profe = crearUsuario('Profesor UCP', 'profe@ucp.edu.ar');
    juan = crearUsuario('Juan Amigo', 'juan@gmail.com');
    [nicanor, profe, juan].forEach((u) => servidor.registrar(u));

    personas = [];
    for (let i = 1; i <= 100; i++) {
      personas.push(crearUsuario(`Persona ${i}`, `persona${i}@ucp.edu.ar`));
    }
    personas.forEach((p) => servidor.registrar(p));

    // 2. tres envíos masivos a las 100 personas, de tres remitentes distintos
    idExamen = servidor.enviar('nicanor@ucp.edu.ar', { destinatarios: contactosDeTodos(), asunto: 'Fecha del examen final', cuerpo: 'Es el lunes 30' });
    idReunion = servidor.enviar('profe@ucp.edu.ar', { destinatarios: contactosDeTodos(), asunto: 'Reunión de consulta', cuerpo: 'Martes a las 18' });
    idManejo = servidor.enviar('juan@gmail.com', { destinatarios: contactosDeTodos(), asunto: 'Examen de manejo', cuerpo: 'Me fue bien' });
  });

  it('1. cada remitente tiene su correo en SUS Enviados, con los 100 destinatarios', () => {
    [nicanor, profe, juan].forEach((remitente) => {
      expect(remitente.getBandejas().consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(1);
      expect(remitente.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(0);
    });
    expect(nicanor.getBandejas().obtenerCorreo(idExamen).getDestinatarios().length).toBe(100);
    expect(profe.getBandejas().obtenerCorreo(idReunion).getDestinatarios().length).toBe(100);
    expect(juan.getBandejas().obtenerCorreo(idManejo).getDestinatarios().length).toBe(100);
  });

  it('2. revisa las bandejas de las 100 personas: 3 correos en Entrada, sin leer, y el resto vacío', () => {
    [idExamen, idReunion, idManejo].forEach((id) => expect(cuantosTienen(id, TipoBandeja.ENTRADA)).toBe(100));

    personas.forEach((p) => {
      expect(p.getBandejas().consultar(TipoBandeja.ENTRADA).cantidad()).toBe(3);
      expect(p.getBandejas().consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(0);
      expect(p.getBandejas().consultar(TipoBandeja.BORRADORES).cantidad()).toBe(0);
      expect(p.getBandejas().consultar(TipoBandeja.ELIMINADOS).cantidad()).toBe(0);
      expect(p.getLectura().contarNoLeidos(TipoBandeja.ENTRADA)).toBe(3);
    });
  });

  it('3. el filtro compuesto deja solo los correos de la UCP sin leer (el de Juan queda afuera)', () => {
    persona(57).getFiltros().registrar(pendientesDeLaUcp());

    const resultado = persona(57).getFiltros().aplicarEn('Pendientes de la UCP', TipoBandeja.ENTRADA);

    expect(ids(resultado)).toEqual([idExamen, idReunion].sort());
    // "Examen de manejo" tiene "examen" en el asunto, pero viene de gmail
    expect(ids(resultado)).not.toContain(idManejo);
  });

  it('4. se aplica a las 100 personas y cada una obtiene un resultado distinto según lo que leyó', () => {
    personas.forEach((p) => p.getFiltros().registrar(pendientesDeLaUcp()));
    // las personas 1 a 50 leen el examen; las 1 a 20 además leen la reunión
    personas.slice(0, 50).forEach((p) => p.getLectura().marcarLeido(idExamen));
    personas.slice(0, 20).forEach((p) => p.getLectura().marcarLeido(idReunion));

    const resultados = personas.map((p) => p.getFiltros().aplicarEn('Pendientes de la UCP', TipoBandeja.ENTRADA));

    expect(ids(resultados[0])).toEqual([]); // persona 1: leyó los dos
    expect(ids(resultados[29])).toEqual([idReunion]); // persona 30: solo leyó el examen
    expect(ids(resultados[56])).toEqual([idExamen, idReunion].sort()); // persona 57: no leyó nada
    // 20 personas con 0 + 30 con 1 + 50 con 2 = 130
    expect(resultados.reduce((total, r) => total + r.length, 0)).toBe(130);
  });

  it('5. el filtro mira SUS bandejas: si la 57 borra el examen, solo cambia su resultado', () => {
    persona(57).getFiltros().registrar(pendientesDeLaUcp());
    persona(58).getFiltros().registrar(pendientesDeLaUcp());

    persona(57).getBandejas().eliminar(idExamen);

    expect(ids(persona(57).getFiltros().aplicarEn('Pendientes de la UCP', TipoBandeja.ENTRADA))).toEqual([idReunion]);
    expect(ids(persona(57).getFiltros().aplicarEn('Pendientes de la UCP', TipoBandeja.ELIMINADOS))).toEqual([idExamen]);
    expect(ids(persona(58).getFiltros().aplicarEn('Pendientes de la UCP', TipoBandeja.ENTRADA))).toEqual([idExamen, idReunion].sort());
    expect(cuantosTienen(idExamen, TipoBandeja.ENTRADA)).toBe(99);
  });

  it('6. los filtros son de cada usuario: registrarlo en uno no lo agrega en los demás', () => {
    persona(57).getFiltros().registrar(pendientesDeLaUcp());

    expect(persona(57).getFiltros().cantidad()).toBe(1);
    expect(personas.filter((p) => p.getFiltros().cantidad() > 0).length).toBe(1);
    expect(() => persona(58).getFiltros().obtener('Pendientes de la UCP')).toThrow('No existe un filtro');
  });

  it('7. se reutiliza un predicado para armar otro filtro compuesto: externos sin leer', () => {
    const externosSinLeer = new FiltroPersonalizado('Externos sin leer', y([no(remitenteDelDominio('@ucp.edu.ar')), no(esLeido())]));
    const entradaDe = (p: IUsuario): ICorreoConsulta[] => p.getBandejas().consultar(TipoBandeja.ENTRADA).listar();

    // a las 100 personas les queda solo el correo de Juan
    personas.forEach((p) => expect(ids(externosSinLeer.aplicar(entradaDe(p)))).toEqual([idManejo]));

    // si la persona 1 lo lee, deja de aparecerle solo a ella
    persona(1).getLectura().marcarLeido(idManejo);
    expect(externosSinLeer.aplicar(entradaDe(persona(1)))).toEqual([]);
    expect(ids(externosSinLeer.aplicar(entradaDe(persona(2))))).toEqual([idManejo]);
  });
});