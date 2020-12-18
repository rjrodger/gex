"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonic_1 = require("jsonic");
const stringify_1 = require("jsonic/stringify");
//Jsonic.use(Stringify)
jsonic_1.Jsonic.use(stringify_1.Stringify);
console.log(jsonic_1.Jsonic('{"a":1}'));
console.log(jsonic_1.Jsonic.parse('{"a":1}'));
console.log(jsonic_1.Jsonic.stringify({ b: 2 }));
//# sourceMappingURL=trial.js.map