import { Contacto } from "../../src/dominio/Contacto";

describe("Contacto", () => {
  it("guarda el nombre completo y la dirección de correo", () => {
    const contacto = new Contacto("Esteban Paniagua", "esteban@ucp.edu.ar");

    expect(contacto.nombre).toBe("Esteban Paniagua");
    expect(contacto.email).toBe("esteban@ucp.edu.ar");
  });

  it("elimina los espacios sobrantes al crearse", () => {
    const contacto = new Contacto("  Esteban Paniagua  ", "  esteban@ucp.edu.ar ");

    expect(contacto.nombre).toBe("Esteban Paniagua");
    expect(contacto.email).toBe("esteban@ucp.edu.ar");
  });

  it("rechaza un nombre vacío", () => {
    expect(() => new Contacto("", "esteban@ucp.edu.ar")).toThrow();
    expect(() => new Contacto("   ", "esteban@ucp.edu.ar")).toThrow();
  });

  it.each(["", "esteban", "esteban@", "@ucp.edu.ar", "esteban@ucp", "esteban ucp@mail.com"])(
    "rechaza la dirección inválida '%s'",
    (emailInvalido) => {
      expect(() => new Contacto("Esteban Paniagua", emailInvalido)).toThrow();
    }
  );

  it.each(["esteban@ucp.edu.ar", "a.b@correo.com", "usuario_1@dominio.org"])(
    "acepta la dirección válida '%s'",
    (emailValido) => {
      expect(() => new Contacto("Esteban Paniagua", emailValido)).not.toThrow();
    }
  );
});