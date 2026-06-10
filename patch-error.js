// Intercept TypeError to capture the stack trace
const OriginalTypeError = global.TypeError;
function PatchedTypeError(...args) {
  const err = new OriginalTypeError(...args);
  if (err.message && err.message.includes('generate')) {
    process.stderr.write('\n\n=== GENERATE ERROR STACK ===\n');
    process.stderr.write(err.stack + '\n');
    process.stderr.write('=== END STACK ===\n\n');
  }
  return err;
}
PatchedTypeError.prototype = OriginalTypeError.prototype;
Object.setPrototypeOf(PatchedTypeError, OriginalTypeError);
global.TypeError = PatchedTypeError;

// Also intercept unhandled rejections
process.on('unhandledRejection', (reason) => {
  if (reason && reason.message && reason.message.includes('generate')) {
    process.stderr.write('\n\n=== UNHANDLED REJECTION: generate ===\n');
    process.stderr.write(reason.stack + '\n');
    process.stderr.write('=== END ===\n\n');
  }
});
