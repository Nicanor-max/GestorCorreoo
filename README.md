# Gestor de Correos Electrónicos con Filtros Dinámicos

![Node.js CI](https://github.com/Nicanor-max/GestorCorreoo/actions/workflows/node.js.yml/badge.svg)

Trabajo práctico **AE4** de **Paradigmas y Lenguajes de Programación II** Ingeniería en Sistemas de Información, Universidad de la Cuenca del Plata (UCP), 2026.

Sistema que simula las operaciones principales de un cliente de correo: redactar, enviar, recibir, buscar, clasificar, eliminar y recuperar mensajes. El dominio está modelado con **Programación Orientada a Objetos** y las búsquedas, filtros y estadísticas usan **Programación Funcional**. Cada usuario tiene su propia agenda, sus cuatro bandejas, sus favoritos y sus filtros.

Como pide la consigna, no tiene interfaz gráfica, API REST ni base de datos: los datos viven en memoria y el envío es simulado dentro del sistema.

## Integrantes

| Nombre | GitHub |
| --- | --- |
| Nicanor Pujol | [@Nicanor-max](https://github.com/Nicanor-max) |
| Esteban Panigua | [@JEstebanPR22](https://github.com/JEstebanPR22) |

## Tecnologías

- **TypeScript 7** con tipado estricto (`strict`, `noImplicitOverride`)
- **Vitest 5** para las pruebas y **@vitest/coverage-v8** para la cobertura
- **Node.js 22** (Vitest 5 necesita Node 22.12 o superior)
- **GitHub Actions** para la integración continua

## Cómo ejecutarlo

```bash
# 1. Clonar el repositorio
git clone https://github.com/Nicanor-max/GestorCorreoo.git
cd GestorCorreoo

# 2. Instalar las dependencias
npm install

# 3. Compilar (verifica los tipos con TypeScript)
npm run build

# 4. Correr las pruebas
npm test
```

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Compila el proyecto con TypeScript en modo estricto y avisa si hay errores de tipos |
| `npm test` | Corre todas las pruebas |
| `npm run test:cov` | Corre las pruebas y mide la cobertura (el informe queda en `coverage/index.html`) |
| `npm run test:watch` | Vuelve a correr las pruebas cada vez que se guarda un archivo |

Para ver cada test con su nombre:

```bash
npx vitest run --reporter=verbose
```

## Requerimientos implementados

| Requerimiento | Clases principales | Pruebas |
| --- | --- | --- |
| RF-01 Creación de correos | `CorreoElectronico`, `DireccionEmail` | `CorreoElectronico.test.ts`, `DireccionEmail.test.ts` |
| RF-02 Envío de correos | `ServicioEnvio`, `ServidorCorreo` | `ServicioEnvio.test.ts`, `EnvioMasivo.test.ts`, `EnvioCorreo3Personas.test.ts` |
| RF-03 Gestión de contactos | `Contacto`, `AgendaContactos` | `Contacto.test.ts`, `AgendaContacto.test.ts` |
| RF-04 Búsqueda de correos | `BuscadorCorreos`, `CriterioBusqueda` y sus 4 hijas | `Busqueda.test.ts` |
| RF-05 Filtros personalizados | `Predicado`, `FiltroPersonalizado`, `GestorFiltros` | `Filtros.test.ts` |
| RF-06 Bandejas y clasificación | `BandejaBase` y sus 4 hijas, `GestorBandejas` | `Bandeja.test.ts`, `GestorBandejas.test.ts` |
| RF-07 Borradores | `GestorBorradores` | `GestorBorradores.test.ts` |
| RF-08 Leídos y no leídos | `GestorLectura` | `GestorLectura.test.ts` |
| RF-09 Favoritos | `GestorFavoritos` | `GestorFavoritos.test.ts` |
| RF-10 Estadísticas funcionales | `EstadisticasCorreos` | `Estadisticas.test.ts` |
| Multiusuario | `Usuario`, `ServidorCorreo`, `crearUsuario` | `MultiUsuario.test.ts` |

## Estructura del proyecto

```
src/
├── TipoBandeja.ts          Enumeración de las 4 bandejas
├── Validar.ts              Validación que lanza un error con mensaje claro
├── Bandejas/               BandejaBase y sus hijas, GestorBandejas, FabricaBandeja
├── Busqueda/               CriterioBusqueda y sus hijas, BuscadorCorreos, FabricaCriterios
├── Comun/                  DireccionEmail
├── Contactos/              Contacto, AgendaContactos
├── Correo/                 CorreoElectronico
├── Estadisticas/           EstadisticasCorreos (RF-10)
├── Filtros/                Predicados, FiltroPersonalizado, GestorFiltros, FabricaFiltros (RF-05)
├── Interfaces/             30 interfaces separadas por uso (consulta, modificación, etc.)
├── Servicios/              ServicioEnvio, GestorBorradores, GestorLectura, GestorFavoritos
├── Usuarios/               Usuario, ServidorCorreo, FabricaUsuarios (multiusuario)
└── Test/                   16 archivos de prueba y el ayudante Ayudante.ts
```

## Conceptos aplicados

### Programación Orientada a Objetos

- **Encapsulamiento y doble encapsulamiento:** todos los atributos son privados (`_asunto`, `_destinatarios`). La propia clase escribe con setters privados que validan con `Validar`, y los getters devuelven copias.
- **Abstracción:** `CriterioBusqueda` y `BandejaBase` son clases abstractas; además hay 30 interfaces.
- **Herencia:** las cuatro bandejas heredan de `BandejaBase` y los cuatro criterios de búsqueda heredan de `CriterioBusqueda`.
- **Polimorfismo:** `recibir()` es un método plantilla; cada bandeja redefine `admite`, `puedeRecibirDesde` y `alRecibir` con `override`.

### Principios SOLID

- **S:** cada clase tiene una sola responsabilidad (`ServicioEnvio` envía, `GestorLectura` maneja leídos).
- **O:** un criterio de búsqueda nuevo es una clase hija nueva, sin modificar el buscador.
- **L:** cualquier bandeja se puede usar donde se espera `BandejaBase`.
- **I:** interfaces chicas por uso; por ejemplo, `IFuenteCorreos` solo permite leer.
- **D:** las clases reciben sus dependencias por constructor, tipadas con interfaces.

### Programación Funcional

- **Predicados y funciones de orden superior:** `asuntoContiene('Examen')` devuelve una función `(correo) => boolean`.
- **Combinadores:** `y`, `o` y `no` reciben predicados y devuelven uno nuevo; están hechos con `reduce`.
- **Filtros dinámicos:** un filtro guarda un predicado, no correos, así que siempre refleja el estado actual. Se admiten hasta 5.
- **Colecciones:** solo `map`, `filter`, `reduce`, `forEach` y `Map`, que son las herramientas vistas en clase. No se usan `sort`, `find`, `every`, `some`, `Set`, `??` ni `?.`.

## Decisiones de diseño

- **Multiusuario:** cada usuario tiene su propio `GestorBandejas`. Al enviar, `ServidorCorreo` deja el correo en los Enviados del remitente y una **copia** en la Entrada de cada destinatario, así que los favoritos, los leídos y las eliminaciones son de cada usuario.
- **Eliminación lógica:** eliminar no borra el correo; lo pasa a Eliminados y guarda su bandeja de origen. Restaurar lo devuelve solo a esa bandeja.
- **Favoritos:** no son una bandeja, sino una marca del correo. La vista de favoritos es un `filter` de los correos activos.
- **Contactos copiados:** el correo guarda una copia de cada contacto, así un correo viejo no cambia si después se edita o se borra el contacto de la agenda.

## Pruebas

- **16 archivos de prueba con 122 tests**, todos en verde.
- **Cobertura:** 100 % de sentencias, funciones y líneas.
- Además de las pruebas por clase, hay recorridos completos con varios usuarios:
  - `EnvioMasivo.test.ts`: envía a 100 usuarios, busca el correo número 57 en Enviados y verifica que esté en la Entrada de la persona 57.
  - `EnvioCorreo3Personas.test.ts`: envía a 3 usuarios; uno marca favorito y otro elimina, sin afectarse entre ellos.

## Integración continua

El flujo `.github/workflows/node.js.yml` se ejecuta en cada push y pull request a `main`. Usa Node 22, instala las dependencias con `npm ci`, **compila** con `npm run build` y **corre las pruebas** con `npm test`.

## Documentación

- Informe técnico con la descripción de la solución, las decisiones de diseño y el diagrama de clases UML: [completar con el enlace]
- Bitácora de las dailies: [completar con el enlace]

## Organización del trabajo

- **3 sprints:** Sprint 1 (correos, contactos y bandejas), Sprint 2 (envío, búsqueda, borradores, leídos y favoritos) y Sprint 3 (filtros, estadísticas, multiusuario y documentación).
- **Dailies** los martes, registradas en la bitácora.
- **Tablero Kanban en Trello**, con una tarjeta por requerimiento.
- **Git:** una rama por integrante (`DevNica`, `DevEsteban`, `DevEsteban2`), integradas en `main`.