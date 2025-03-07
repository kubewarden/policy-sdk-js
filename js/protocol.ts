declare namespace Javy {
  namespace IO {
    function readSync(fd: number, buffer: Uint8Array): number;
    function writeSync(fd: number, buffer: Uint8Array): void;
  }
}

/**
 * Reads all available input from stdin and returns it as a single Uint8Array.
 *
 * @returns {Uint8Array} The complete input read from stdin.
 */
export function readInput(): Uint8Array {
  const chunkSize = 1024;
  const inputChunks: Uint8Array[] = [];
  let totalBytes = 0;

  // Read all the available bytes
  while (true) {
    const buffer = new Uint8Array(chunkSize);
    // Stdin file descriptor
    const fd = 0;
    const bytesRead = Javy.IO.readSync(fd, buffer);

    totalBytes += bytesRead;
    if (bytesRead === 0) {
      break;
    }
    inputChunks.push(buffer.subarray(0, bytesRead));
  }

  // Assemble input into a single Uint8Array
  const { finalBuffer } = inputChunks.reduce(
    (context, chunk) => {
      context.finalBuffer.set(chunk, context.bufferOffset);
      context.bufferOffset += chunk.length;
      return context;
    },
    { finalBuffer: new Uint8Array(totalBytes), bufferOffset: 0 },
  );

  return finalBuffer;
}

/**
 * Writes the given output to the standard output (stdout) file descriptor.
 *
 * @param output - The data to be written to stdout. It can be of any type and will be
 *                 serialized to a JSON string before being written.
 */
export function writeOutput(output: any) {
  const encodedOutput = new TextEncoder().encode(JSON.stringify(output));
  const buffer = new Uint8Array(encodedOutput);
  // Stdout file descriptor
  const fd = 1;
  Javy.IO.writeSync(fd, buffer);
}
