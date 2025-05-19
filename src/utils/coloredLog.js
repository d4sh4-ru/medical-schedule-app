const COLORS = {
  reset: '\x1b[0m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(color = 'reset', ...args) {
  const colorCode = COLORS[color] || COLORS.reset;
  const resetCode = COLORS.reset;

  const output = args.map((arg) =>
    typeof arg === 'string' ? `${colorCode}${arg}${resetCode}` : arg
  );

  console.log(...output);
}

// Упрощённый API
const log = {
  red: (...args) => colorize('red', ...args),
  green: (...args) => colorize('green', ...args),
  yellow: (...args) => colorize('yellow', ...args),
  blue: (...args) => colorize('blue', ...args),
  magenta: (...args) => colorize('magenta', ...args),
  cyan: (...args) => colorize('cyan', ...args),
  white: (...args) => colorize('white', ...args),
  raw: colorize,
  error: (message, ...args) => console.error(`\x1b[31m${message}`, ...args, `\x1b[0m`),
  warn: (message, ...args) => console.warn(`\x1b[33m${message}\x1b[0m`, ...args),
};

export default log;

