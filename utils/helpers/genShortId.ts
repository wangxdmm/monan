/**
 * inspired by https://github.com/zzzhan/js-shortid
 * just change it to ts add type support
 */

function paddingLeft(padding, val): string {
  return (padding + val).slice(-padding.length);
}

export interface ShortIdOpt {
  salts: number;
  interval: number;
  initTime: number;
  symbols?: string[];
}

const BASE = 62;

export type ShortIdIns = InstanceType<typeof ShortId>;
export class ShortId {
  opt: ShortIdOpt = {
    salts: 2,
    interval: 1,
    initTime: 1460332800000,
    // prettier-ignore
    symbols: ['0','1','2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f','g','h','i','j',
    'k','l','m','n','o','p','q','r','s','t',
    'u','v','w','x','y','z','A','B','C','D',
    'E','F','G','H','I','J','K','L','M','N',
    'O','P','Q','R','S','T','U','V','W','X','Y','Z'],
  };

  constructor(opt?: Partial<ShortIdOpt>) {
    this.opt = Object.assign(this.opt, opt || {});
  }

  toBase(decimal, base) {
    const opt = this.opt,
      symbols = opt.symbols!;
    let conversion = "";
    if (base > symbols.length || base <= 1) {
      return false;
    }
    while (decimal >= 1) {
      conversion = symbols[decimal - base * Math.floor(decimal / base)] + conversion;
      decimal = Math.floor(decimal / base);
    }
    return base < 11 ? parseInt(conversion) : conversion;
  }

  salts() {
    const opt = this.opt;
    const salts = opt.salts || 2;
    let ret = "";

    for (let i = 0; i < salts; i++) {
      const salt = Math.floor(Math.random() * 3844);
      ret += paddingLeft("00", this.toBase(salt, BASE));
    }

    return ret;
  }

  gen() {
    const opt = this.opt;
    const interval = opt.interval;
    const initime = opt.initTime;
    //default millisecond since init time
    const elapsed = interval > 0 ? Math.floor((new Date().getTime() - initime) / interval) : 0,
      salts = this.salts();
    return elapsed === 0 ? salts : this.toBase(elapsed, BASE) + salts;
  }
}
