"use strict";
/* Copyright (c) 2011-2020 Richard Rodger, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gex = void 0;
class Gexer {
    constructor(gexspec) {
        this.desc = '';
        this.gexmap = {};
        if (null != gexspec) {
            let gexstrs = Array.isArray(gexspec) ? gexspec : [gexspec];
            gexstrs.forEach((str) => {
                this.gexmap[str] = this.re(this.clean(str));
            });
        }
    }
    dodgy(obj) {
        return null == obj || Number.isNaN(obj);
    }
    clean(gexexp) {
        let gexstr = '' + gexexp;
        return this.dodgy(gexexp) ? '' : gexstr;
    }
    match(str) {
        str = '' + str;
        let hasmatch = false;
        let gexstrs = Object.keys(this.gexmap);
        for (let i = 0; i < gexstrs.length && !hasmatch; i++) {
            hasmatch = !!this.gexmap[gexstrs[i]].exec(str);
        }
        return hasmatch;
    }
    on(obj) {
        if (null == obj) {
            return null;
        }
        let typeof_obj = typeof obj;
        if ('string' === typeof_obj ||
            'number' === typeof_obj ||
            'boolean' === typeof_obj ||
            obj instanceof Date ||
            obj instanceof RegExp) {
            return this.match(obj) ? obj : null;
        }
        else if (Array.isArray(obj)) {
            let out = [];
            for (let i = 0; i < obj.length; i++) {
                if (!this.dodgy(obj[i]) && this.match(obj[i])) {
                    out.push(obj[i]);
                }
            }
            return out;
        }
        else {
            let outobj = {};
            for (let p in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, p)) {
                    if (this.match(p)) {
                        outobj[p] = obj[p];
                    }
                }
            }
            return outobj;
        }
    }
    esc(gexexp) {
        let gexstr = this.clean(gexexp);
        gexstr = gexstr.replace(/\*/g, '**');
        gexstr = gexstr.replace(/\?/g, '*?');
        return gexstr;
    }
    escregexp(restr) {
        return restr ? ('' + restr).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : '';
    }
    re(gs) {
        if ('' === gs || gs) {
            gs = this.escregexp(gs);
            // use [\s\S] instead of . to match newlines
            gs = gs.replace(/\\\*/g, '[\\s\\S]*');
            gs = gs.replace(/\\\?/g, '[\\s\\S]');
            // escapes ** and *?
            gs = gs.replace(/\[\\s\\S\]\*\[\\s\\S\]\*/g, '\\*');
            gs = gs.replace(/\[\\s\\S\]\*\[\\s\\S\]/g, '\\?');
            gs = '^' + gs + '$';
            return new RegExp(gs);
        }
        else {
            let gexstrs = Object.keys(this.gexmap);
            return 1 == gexstrs.length ? this.gexmap[gexstrs[0]] : { ...this.gexmap };
        }
    }
    toString() {
        let d = this.desc;
        return '' != d ? d : (this.desc = 'Gex[' + Object.keys(this.gexmap) + ']');
    }
    inspect() {
        return this.toString();
    }
}
function Gex(gexspec) {
    return new Gexer(gexspec);
}
exports.Gex = Gex;
if ('undefined' !== typeof module) {
    module.exports = Gex;
    module.exports.Gex = Gex;
}
exports.default = Gex;
//# sourceMappingURL=gex.js.map