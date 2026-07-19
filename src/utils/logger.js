/**
 * ─────────────────────────────────────────────
 *  Logger — lightweight structured console logger
 * ─────────────────────────────────────────────
 * Keeps log output consistent across the whole codebase without pulling in
 * a heavy dependency. Every log line is timestamped and tagged by scope.
 */

const COLORS = {
    reset: '\x1b[0m',
    gray: '\x1b[90m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m'
};

function timestamp() {
    return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function format(tag, color, scope, message) {
    return `${COLORS.gray}[${timestamp()}]${COLORS.reset} ${color}${tag}${COLORS.reset} ${COLORS.magenta}[${scope}]${COLORS.reset} ${message}`;
}

module.exports = {
    info(scope, message) {
        console.log(format('INFO ', COLORS.cyan, scope, message));
    },
    success(scope, message) {
        console.log(format('OK   ', COLORS.green, scope, message));
    },
    warn(scope, message) {
        console.warn(format('WARN ', COLORS.yellow, scope, message));
    },
    error(scope, message, err) {
        console.error(format('ERROR', COLORS.red, scope, message));
        if (err && err.stack) console.error(COLORS.gray + err.stack + COLORS.reset);
    },
    music(scope, message) {
        console.log(format('MUSIC', COLORS.magenta, scope, message));
    }
};
