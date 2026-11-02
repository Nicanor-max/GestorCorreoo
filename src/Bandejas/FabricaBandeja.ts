import { BandejaBorradores } from './BandejaBorrador';
import { BandejaEliminados } from './BandejaEliminados';
import { BandejaEntrada } from './BandejaEntrada';
import { BandejaEnviados } from './BandejaEnviados';
import { IBandeja } from '../Interfaces/IBandeja';

export function crearBandejas(): IBandeja[] {
  return [new BandejaEntrada(), new BandejaEnviados(), new BandejaBorradores(), new BandejaEliminados()];
}