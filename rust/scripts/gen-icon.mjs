// Writes a 1024x1024 RGBA PNG (blue rounded feel: solid square on transparent
// background) with zero dependencies, as the source icon for `tauri icon`.
import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync } from "node:fs";

const SIZE = 1024;
const MARGIN = 96;

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA

const stride = 1 + SIZE * 4; // filter byte + RGBA per pixel
const raw = Buffer.alloc(SIZE * stride);
for (let y = 0; y < SIZE; y++) {
  const rowStart = y * stride;
  for (let x = 0; x < SIZE; x++) {
    const inside =
      x >= MARGIN && x < SIZE - MARGIN && y >= MARGIN && y < SIZE - MARGIN;
    if (inside) {
      const o = rowStart + 1 + x * 4;
      raw[o] = 0x1f;
      raw[o + 1] = 0x6f;
      raw[o + 2] = 0xd6;
      raw[o + 3] = 0xff;
    } // else: transparent black
  }
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync("app-icon.png", png);
console.log(`wrote app-icon.png (${png.length} bytes)`);
