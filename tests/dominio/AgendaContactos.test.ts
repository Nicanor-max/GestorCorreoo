import { AgendaContactos } from "../../src/dominio/AgendaContactos";
import { Contacto } from "../../src/dominio/Contacto";

describe("AgendaContactos", () => {
  let agenda: AgendaContactos;
  let esteban: Contacto;
  let nicanor: Contacto;

  beforeEach(() => {
    agenda = new AgendaContactos();
    esteban = new Contacto("Esteban Paniagua", "esteban@ucp.edu.ar");
    nicanor = new Contacto("Nicanor Pujol", "nicanor@ucp.edu.ar");
  });

  it("empieza vacía", () => {
    expect(agenda.listar()).toHaveLength(0);
  });

  it("permite agregar contactos", () => {
    agenda.agregar(esteban);
    agenda.agregar(nicanor);

    expect(agenda.listar()).toHaveLength(2);
    expect(agenda.listar()).toContain(esteban);
    expect(agenda.listar()).toContain(nicanor);
  });

  it("permite consultar un contacto por su dirección de correo", () => {
    agenda.agregar(esteban);

    expect(agenda.consultar("esteban@ucp.edu.ar")).toBe(esteban);
  });

  it("devuelve undefined al consultar una dirección que no existe", () => {
    agenda.agregar(esteban);

    expect(agenda.consultar("nadie@ucp.edu.ar")).toBeUndefined();
  });

  it("permite modificar un contacto existente", () => {
    agenda.agregar(esteban);
    const actualizado = new Contacto("Esteban A. Paniagua", "esteban@ucp.edu.ar");

    agenda.modificar("esteban@ucp.edu.ar", actualizado);

    expect(agenda.consultar("esteban@ucp.edu.ar")).toBe(actualizado);
    expect(agenda.listar()).toHaveLength(1);
  });

  it("permite cambiar la dirección de correo al modificar", () => {
    agenda.agregar(esteban);
    const conOtroEmail = new Contacto("Esteban Paniagua", "esteban.p@ucp.edu.ar");

    agenda.modificar("esteban@ucp.edu.ar", conOtroEmail);

    expect(agenda.consultar("esteban@ucp.edu.ar")).toBeUndefined();
    expect(agenda.consultar("esteban.p@ucp.edu.ar")).toBe(conOtroEmail);
  });

  it("rechaza modificar un contacto que no existe", () => {
    expect(() => agenda.modificar("nadie@ucp.edu.ar", esteban)).toThrow();
  });

  it("permite eliminar un contacto", () => {
    agenda.agregar(esteban);
    agenda.agregar(nicanor);

    agenda.eliminar("esteban@ucp.edu.ar");

    expect(agenda.consultar("esteban@ucp.edu.ar")).toBeUndefined();
    expect(agenda.listar()).toEqual([nicanor]);
  });

  it("rechaza eliminar un contacto que no existe", () => {
    expect(() => agenda.eliminar("nadie@ucp.edu.ar")).toThrow();
  });

  it("no deja modificar la agenda desde la lista que devuelve", () => {
    agenda.agregar(esteban);

    const lista = agenda.listar() as Contacto[];
    lista.push(nicanor);

    expect(agenda.listar()).toHaveLength(1);
  });
  it("rechaza agregar un contacto con una dirección que ya existe", () => {
    agenda.agregar(esteban);
    const otroConMismoEmail = new Contacto("Otro Esteban", "esteban@ucp.edu.ar");

    expect(() => agenda.agregar(otroConMismoEmail)).toThrow();
    expect(agenda.listar()).toEqual([esteban]);
  });

  it("considera iguales las direcciones que solo difieren en mayúsculas", () => {
    agenda.agregar(esteban);
    const enMayusculas = new Contacto("Esteban Paniagua", "ESTEBAN@UCP.EDU.AR");

    expect(() => agenda.agregar(enMayusculas)).toThrow();
  });

  it("rechaza modificar un contacto hacia una dirección que usa otro", () => {
    agenda.agregar(esteban);
    agenda.agregar(nicanor);
    const conEmailDeNicanor = new Contacto("Esteban Paniagua", "nicanor@ucp.edu.ar");

    expect(() => agenda.modificar("esteban@ucp.edu.ar", conEmailDeNicanor)).toThrow();
    expect(agenda.consultar("esteban@ucp.edu.ar")).toBe(esteban);
    expect(agenda.consultar("nicanor@ucp.edu.ar")).toBe(nicanor);
  });

});