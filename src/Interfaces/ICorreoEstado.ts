// RF-08 y RF-09: estados de lectura y favorito
export interface ICorreoEstado {
  marcarLeido(): void;
  marcarNoLeido(): void;
  marcarFavorito(): void;
  quitarFavorito(): void;
}