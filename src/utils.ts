import { gzip } from 'node:zlib';
import { promisify } from 'util';


const gzipAsync = promisify(gzip);


export const compressData = async (input: Uint8Array): Promise<string> => {
  const data = new TextDecoder().decode(input);
  const buffer = await gzipAsync(data);
  return buffer.toString('base64');
}
