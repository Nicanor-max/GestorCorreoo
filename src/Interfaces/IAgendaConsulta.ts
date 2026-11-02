import { IContactoConsulta } from './IContactoConsulta';

export interface IAgendaConsulta {
  buscarPorEmail(email: string): IContactoConsulta | null;
  listar(): IContactoConsulta[];
  cantidad(): number;
}