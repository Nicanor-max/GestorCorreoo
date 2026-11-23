import { beforeEach, describe, expect, it } from 'vitest';
import { FiltroPersonalizado } from '../Filtros/FiltroPersonalizado';
import { asuntoContiene, cuerpoContiene, esLeido, no, o, remitenteDelDominio, y } from '../Filtros/Predicado';
import { TipoBandeja } from '../TipoBandeja';
import { IUsuario } from '../Interfaces/IUsuarios';
import { crearUsuario } from '../Usuarios/FabricaUsuarios';
import { ServidorCorreo } from '../Usuarios/ServidorCorreo';

describe('Envío masivo con filtros compuestos', () => {
  let servidor: ServidorCorreo;
  let remitente: IUsuario;
  let destinatarios: IUsuario[];

  beforeEach(() => {
    servidor = new ServidorCorreo();
    remitente = crearUsuario('Nicanor Pujol', 'nicanor@ucp.edu.ar');
    servidor.registrar(remitente);

    destinatarios = [];
    for (let numero = 1; numero <= 100; numero++) {
      const destinatario = crearUsuario(`Persona ${numero}`, `persona${numero}@ucp.edu.ar`);
      servidor.registrar(destinatario);
      destinatarios.push(destinatario);
    }
  });

  it('envía un correo a 100 personas y filtra sus copias con AND, OR y NOT', () => {
    const id = servidor.enviar('nicanor@ucp.edu.ar', {
      destinatarios: destinatarios.map((destinatario) => destinatario.getContacto()),
      asunto: 'Aviso del taller de programación',
      cuerpo: 'Confirmen su inscripción antes del viernes',
    });

    const filtro = new FiltroPersonalizado(
      'Avisos de inscripción pendientes',
      y([
        remitenteDelDominio('@ucp.edu.ar'),
        o([asuntoContiene('inscripción'), cuerpoContiene('inscripción')]),
        no(esLeido()),
      ]),
    );
    destinatarios.forEach((destinatario) => destinatario.getFiltros().registrar(filtro));

    expect(remitente.getBandejas().consultar(TipoBandeja.ENVIADOS).cantidad()).toBe(1);
    expect(destinatarios.filter((destinatario) =>
      destinatario.getBandejas().ubicacionDe(id) === TipoBandeja.ENTRADA,
    )).toHaveLength(100);

    destinatarios[99].getLectura().marcarLeido(id);
    const resultados = destinatarios.map((destinatario) =>
      destinatario.getFiltros().aplicarEn('Avisos de inscripción pendientes', TipoBandeja.ENTRADA),
    );

    expect(resultados.slice(0, 99).every((correos) =>
      correos.length === 1 && correos[0].getId() === id,
    )).toBe(true);
    expect(resultados[99]).toEqual([]);
  });
});
