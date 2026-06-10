const origTypeError = global.TypeError;
global.TypeError = class extends origTypeError {
  constructor(...args) {
    super(...args);
    if (this.message && this.message.includes('generate')) {
      const origPrepare = Error.prepareStackTrace;
      Error.prepareStackTrace = (err, stack) => {
        return stack.map(f => `  at ${f.getFunctionName()} (${f.getFileName()}:${f.getLineNumber()})`).join('\n');
      };
      Error.prepareStackTrace = origPrepare;
      console.error('\n=== TypeError caught:', this.message, '===');
      console.error(this.stack);
      console.error('===\n');
    }
  }
};
