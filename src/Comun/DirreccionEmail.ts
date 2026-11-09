import { validar } from '../Validar';

// Objeto de valor: una dirección de email siempre válida y normalizada
export class DireccionEmail {
  private static readonly FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // encapsulamiento
  private _valor: string = '';

  constructor(valor: string) {
    this.setValor(valor);
  }

  public static normalizar(valor: string): string {
    return valor.trim().toLowerCase();
  }

  public getValor(): string {
    return this._valor;
  }

  public esIgualA(otra: DireccionEmail): boolean {
    return this.getValor() === otra.getValor();
  }

  private setValor(valor: string): void {
    const normalizado = DireccionEmail.normalizar(valor);
    validar(DireccionEmail.FORMATO.test(normalizado), `La dirección "${valor}" no tiene un formato válido`);
    this._valor = normalizado;
  }
}