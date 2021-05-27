import {assert} from 'chai';
import {Chance} from 'chance';
import {Buffer} from 'buffer';
import {
  default as EncodeTools,
  BinaryInputOutput,
  DEFAULT_ENCODE_TOOLS_NATIVE_OPTIONS as DEFAULT_ENCODE_TOOLS_OPTIONS,
} from '../../EncodeToolsNative';
const LZMA = require('lzma-native').LZMA;
import {
  CompressRunner, EncodeToolsNativeRunner,
  HashObjectRunner,
  HashRunner,
  HashStringRunner,
  randomBuffer,
  randomOptions, SerializeObjectRunner
} from "../common/EncodeToolsNativeRunner";
const crypto = require('crypto');


const toBuffer = require('typedarray-to-buffer');
const  Hashids = require('hashids/cjs');

const base32 = require('base32.js');

describe('EncodeToolsNative', async function () {
  let chance = Chance();

  let tests: EncodeToolsNativeRunner<any, any, any, any>[] = [
    new HashObjectRunner(),
    new HashStringRunner(),
    new HashRunner(),
    new SerializeObjectRunner(),
    new CompressRunner()
  ];


  for (let xxhash of [ 'XXHash3', 'XXHash64', 'XXHash32' ]) {
    let xxhashLowercase = xxhash.toLowerCase();
    describe(xxhashLowercase, async function () {
      it('should return a valid '+xxhashLowercase, async function (){
        let buf = randomBuffer();

        const Hash = require('xxhash-addon')[xxhash];
        let hash = new Hash();
        let buf1 = hash.hash(buf);
        let buf2 = await (EncodeTools as any)[xxhashLowercase](buf);

        assert.deepEqual(buf2, buf1, 'Hashes were not the same');
      });
    });
  }

  function nativeHash(buffer: BinaryInputOutput, algo: string): Buffer {
    const hash = crypto.createHash(algo);
    hash.update(Buffer.from(buffer as any));
    return hash.digest();
  }

  for (let algo of [ 'sha1', 'sha512', 'md5' ]) {
    describe(algo, async function () {
      it('should return a valid '+algo, async function (){
        let buf = randomBuffer();

        let buf1 = nativeHash(buf, algo);
        let buf2 = await (EncodeTools as any)[algo](buf);

        assert.deepEqual(buf2, buf1, 'Hashes were not the same');
      });
    });
  }

  describe('compressLZMA', async function () {
    this.timeout(60e3);
    it('should compress buffer as lzma', async function () {
      let inBuf = randomBuffer();
      let lzma = new LZMA();
      let buf1 = await EncodeTools.compressLZMA(inBuf, chance.integer({ min: 1, max: 9 }))
      let buf2 = Buffer.from(await new Promise<Buffer>((resolve, reject) => {
        lzma.decompress(buf1, (result: any, error: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      }));

      assert.isTrue(Buffer.isBuffer(buf2), 'LZMA did not return a buffer');
      assert.deepEqual(buf2, inBuf, 'Buffers are not the same');
    });
  });

  describe('decompressLZMA', async function () {
    this.timeout(60e3);
    it('should compress buffer as lzma', async function () {
      let inBuf = randomBuffer();
      let lzma = new LZMA();
      let buf1 = Buffer.from(await new Promise<Buffer>((resolve, reject) => {
        lzma.compress(inBuf, chance.integer({ min: 1, max: 9 }),(result: any, error: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      }));

      let buf2 = await EncodeTools.decompressLZMA(buf1);

      assert.isTrue(Buffer.isBuffer(buf2), 'LZMA did not return a buffer');
      assert.deepEqual(buf2, inBuf, 'Buffers are not the same');
    });
  });


  describe('get WithDefaults', async function () {
    it('encode tools options should have the default options', async function () {
      let enc = EncodeTools.WithDefaults;
      assert.deepEqual(enc.options, DEFAULT_ENCODE_TOOLS_OPTIONS, 'Options are not the default options');
    });
  });
  describe('create', async function () {
    it('encode tools options should have the random options', async function () {
      let opts = randomOptions();
      let enc = new EncodeTools(opts);
      assert.deepEqual(enc.options, opts, 'Options are not the default options');
    });
  });

  for (let test of tests) {
    await test.testEncode();

    if (test.hasDecode) {
      await test.testDecode();
    }
  }

});
