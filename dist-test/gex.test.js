"use strict";
/* Copyright (c) 2013-2022 Richard Rodger, MIT License */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const __1 = __importStar(require(".."));
function s(obj) {
    return JSON.stringify(obj);
}
(0, node_test_1.describe)('Gex', function () {
    (0, node_test_1.test)('happy', () => {
        var ab = (0, __1.Gex)('ab');
        strict_1.default.equal(ab.on('ab'), 'ab');
        strict_1.default.equal(ab.on('a'), null);
        strict_1.default.equal(ab.on('b'), null);
        strict_1.default.equal(ab.on('ba'), null);
        strict_1.default.equal(ab.on('abc'), null);
        strict_1.default.equal(ab.on('cab'), null);
        strict_1.default.equal(ab.on('cabc'), null);
        var a_b = (0, __1.Gex)('a*b');
        strict_1.default.equal(a_b.on('acb'), 'acb');
        strict_1.default.equal(a_b.on('adb'), 'adb');
        strict_1.default.equal(a_b.on('aab'), 'aab');
        strict_1.default.equal(a_b.on('abb'), 'abb');
        strict_1.default.equal(a_b.on('aaa'), null);
        strict_1.default.equal(a_b.on('bbb'), null);
        strict_1.default.equal(a_b.on('bca'), null);
        strict_1.default.equal(a_b.on('ba'), null);
        strict_1.default.equal(a_b.on('ac'), null);
        strict_1.default.equal(a_b.on('a'), null);
        var a$b = (0, __1.Gex)('a?b');
        strict_1.default.equal(a$b.on('acb'), 'acb');
        strict_1.default.equal(a$b.on('adb'), 'adb');
        strict_1.default.equal(a$b.on('aab'), 'aab');
        strict_1.default.equal(a$b.on('abb'), 'abb');
        strict_1.default.equal(a$b.on('aaa'), null);
        strict_1.default.equal(a$b.on('bbb'), null);
        strict_1.default.equal(a$b.on('bca'), null);
        strict_1.default.equal(a$b.on('ba'), null);
        strict_1.default.equal(a$b.on('ac'), null);
        strict_1.default.equal(a$b.on('a'), null);
        strict_1.default.equal(a_b.on('accb'), 'accb');
        strict_1.default.equal(a_b.on('acccb'), 'acccb');
        strict_1.default.equal(a_b.on('aaab'), 'aaab');
        strict_1.default.equal(a_b.on('aabb'), 'aabb');
        strict_1.default.equal(a_b.on('abbb'), 'abbb');
    });
    (0, node_test_1.test)('module-root', () => {
        var ab = (0, __1.default)('ab');
        strict_1.default.equal(ab.on('ab'), 'ab');
    });
    (0, node_test_1.test)('arrays', () => {
        var a_ = (0, __1.Gex)('a*');
        strict_1.default.equal(s(a_.on(['ab', 'ac'])), s(['ab', 'ac']));
        strict_1.default.equal(s(a_.on(['ab', 'dd', 'ac'])), s(['ab', 'ac']));
        strict_1.default.equal(s(a_.on(['ab', 'dd', 'ee'])), s(['ab']));
        strict_1.default.equal(s(a_.on(['ff', 'dd', 'ee'])), s([]));
        strict_1.default.equal(s(a_.on([])), s([]));
        strict_1.default.equal(s(a_.on([null])), s([]));
        strict_1.default.equal(s(a_.on(['ab', null, 'dd', undefined, 'ee', NaN])), s(['ab']));
    });
    (0, node_test_1.test)('objects', () => {
        var foo_ = (0, __1.Gex)('foo*');
        strict_1.default.equal(s(foo_.on({ foo: 1 })), s({ foo: 1 }));
        strict_1.default.equal(s(foo_.on({ foo: 1, doo: 2 })), s({ foo: 1 }));
        strict_1.default.equal(s(foo_.on({ foo: 1, doo: 2, food: 3 })), s({ foo: 1, food: 3 }));
        var o0 = { food: 3 };
        var o1 = Object.create(o0);
        o1.foo = 1;
        o1.doo = 2;
        strict_1.default.equal(s(foo_.on(o1)), s({ foo: 1 }));
    });
    (0, node_test_1.test)('object without prototype', () => {
        var obj = Object.create(null);
        obj.foo = 'bar';
        strict_1.default.equal(s({ foo: 'bar' }), s((0, __1.Gex)('foo').on(obj)));
    });
    (0, node_test_1.test)('dodgy', () => {
        strict_1.default.equal((0, __1.Gex)(null).on('aaa'), null);
        strict_1.default.equal((0, __1.Gex)(NaN).on('aaa'), null);
        strict_1.default.equal((0, __1.Gex)(undefined).on('aaa'), null);
        var g = (0, __1.Gex)('g');
        strict_1.default.equal(g.on(undefined), null);
        strict_1.default.equal(g.on(null), null);
        strict_1.default.equal(g.on(NaN), null);
        strict_1.default.equal(g.on(true), null);
        strict_1.default.equal(g.on(false), null);
        strict_1.default.equal(g.on(new Date()), null);
        strict_1.default.equal(g.on(/x/), null);
        strict_1.default.equal(g.on(''), null);
    });
    (0, node_test_1.test)('escapes', () => {
        var g = (0, __1.Gex)('a**b');
        strict_1.default.equal(g.toString(), 'Gex[a**b]');
        strict_1.default.equal(g.re().toString(), '/^a\\*b$/');
        strict_1.default.equal(g.on('a*b'), 'a*b');
        strict_1.default.equal(g.on('a**b'), null);
        g = (0, __1.Gex)('a*?b');
        strict_1.default.equal(g.toString(), 'Gex[a*?b]');
        strict_1.default.equal(g.re().toString(), '/^a\\?b$/');
        strict_1.default.equal(g.on('a?b'), 'a?b');
        strict_1.default.equal(g.on('a*?b'), null);
        strict_1.default.equal(g.esc(''), '');
        strict_1.default.equal(g.esc('*'), '**');
        strict_1.default.equal(g.esc('?'), '*?');
        strict_1.default.equal(g.esc('a*'), 'a**');
        strict_1.default.equal(g.esc('a?'), 'a*?');
        strict_1.default.equal(g.esc('a*b*c'), 'a**b**c');
        strict_1.default.equal(g.esc('a?b?c'), 'a*?b*?c');
    });
    (0, node_test_1.test)('newlines', () => {
        var g = (0, __1.Gex)('a*b');
        strict_1.default.equal('/^a[\\s\\S]*b$/', '' + g.re());
        strict_1.default.equal(g.on('a\nb'), 'a\nb');
    });
    (0, node_test_1.test)('zero', () => {
        strict_1.default.equal((0, __1.Gex)('0').on('0'), '0');
        strict_1.default.equal((0, __1.Gex)('0*').on('0'), '0');
        strict_1.default.equal((0, __1.Gex)('*0').on('0'), '0');
        strict_1.default.equal((0, __1.Gex)('*0*').on('0'), '0');
        strict_1.default.equal((0, __1.Gex)(['0']).on('0'), '0');
        strict_1.default.equal((0, __1.Gex)(['0*']).on('0'), '0');
        strict_1.default.equal((0, __1.Gex)(['*0']).on('0'), '0');
        strict_1.default.equal((0, __1.Gex)(['*0*']).on('0'), '0');
        strict_1.default.equal((0, __1.Gex)(1).on('1'), '1');
        strict_1.default.equal((0, __1.Gex)(100).on('100'), '100');
        strict_1.default.equal((0, __1.Gex)(0).on('0'), '0');
    });
    (0, node_test_1.test)('multi', () => {
        var g = (0, __1.Gex)(['a', 'b']);
        strict_1.default.equal(g.on('a'), 'a');
        strict_1.default.equal(g.on('b'), 'b');
        strict_1.default.equal(s(g.re()), '{"a":{},"b":{}}');
        g = (0, __1.Gex)(['a*', 'b']);
        strict_1.default.equal(g.on('ax'), 'ax');
        strict_1.default.equal(g.on('b'), 'b');
        strict_1.default.equal(s(g.re()), '{"a*":{},"b":{}}');
        strict_1.default.equal((0, __1.Gex)(['a*', 'b*']).on('bx'), 'bx');
        strict_1.default.equal((0, __1.Gex)(['a*', 'b*']).on(['ax', 'zz', 'bx']).toString(), 'ax,bx');
    });
    (0, node_test_1.test)('inspect', () => {
        var g = (0, __1.Gex)('a*');
        strict_1.default.equal(g.toString(), 'Gex[a*]');
        strict_1.default.equal(g.inspect(), 'Gex[a*]');
        g = (0, __1.Gex)(['a*', '*b']);
        strict_1.default.equal(g.inspect(), 'Gex[a*,*b]');
    });
    (0, node_test_1.test)('funky', () => {
        strict_1.default.equal((0, __1.Gex)('').on('a'), null);
        strict_1.default.equal((0, __1.Gex)(null).on('a'), null);
        strict_1.default.equal((0, __1.Gex)(undefined).on('a'), null);
        strict_1.default.equal((0, __1.Gex)(NaN).on('a'), null);
        strict_1.default.equal((0, __1.Gex)(/a/).on('a'), null);
    });
});
//# sourceMappingURL=gex.test.js.map