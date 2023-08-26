"use strict";
/* eslint-disable local-rules/disallow-side-effects */
/**
 * Keep references on console methods to avoid triggering patched behaviors
 *
 * NB: in some setup, console could already be patched by another SDK.
 * In this case, some display messages can be sent by the other SDK
 * but we should be safe from infinite loop nonetheless.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalConsole = exports.display = exports.ConsoleApiName = void 0;
exports.ConsoleApiName = {
    log: 'log',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
};
var display = function (api) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!Object.prototype.hasOwnProperty.call(exports.ConsoleApiName, api)) {
        api = exports.ConsoleApiName.log;
    }
    exports.display[api].apply(exports.display, args);
};
exports.display = display;
/**
 * When building JS bundles, some users might use a plugin[1] or configuration[2] to remove
 * "console.*" references. This causes some issue as we expect `console.*` to be defined.
 * As a workaround, let's use a variable alias, so those expressions won't be taken into account by
 * simple static analysis.
 *
 * [1]: https://babeljs.io/docs/babel-plugin-transform-remove-console/
 * [2]: https://github.com/terser/terser#compress-options (look for drop_console)
 */
exports.globalConsole = console;
exports.display.debug = exports.globalConsole.debug.bind(exports.globalConsole);
exports.display.log = exports.globalConsole.log.bind(exports.globalConsole);
exports.display.info = exports.globalConsole.info.bind(exports.globalConsole);
exports.display.warn = exports.globalConsole.warn.bind(exports.globalConsole);
exports.display.error = exports.globalConsole.error.bind(exports.globalConsole);
//# sourceMappingURL=display.js.map