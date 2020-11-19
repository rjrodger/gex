declare class Gex {
    gexmap: {
        [key: string]: RegExp;
    };
    desc: string;
    constructor(gexspec: string | string[]);
    dodgy(obj: any): boolean;
    clean(gexexp: any): string;
    match(str: any): boolean;
    on(obj: any): any;
    esc(gexexp: any): string;
    escregexp(restr: string): string;
    re(gs: string): RegExp | any;
    toString(): string;
    inspect(): string;
}
declare function gex(gexspec: string | string[]): Gex;
declare namespace gex {
    var Gex: typeof globalThis.Gex;
}
