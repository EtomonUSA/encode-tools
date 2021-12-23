# DEPRECATED

This package has been deprecated, see [@znetstar/encode-tools-native](https://github.com/znetstar/encode-tools-native) for a drop-in replacement.

# Etomon Encode Tools

[![NPM](https://nodei.co/npm/@etomon/encode-tools.png)](https://nodei.co/npm/@etomon/encode-tools/)

[![Build Status](https://travis-ci.com/EtomonUSA/encode-tools.svg?branch=master)](https://travis-ci.com/EtomonUSA/encode-tools)

This package aggregates different libraries for encoding, serializing, compressing, generating ids and hashing things, exposing a common interface. 

*Many* other packages serve the same purpose, but our objective is to ensure a consistent experience in both node.js and the browser and standardize the api so functions work the same way across different underlying libraries.

Etomon Encode Tools also has a command line wrapper [`encode-cli`](https://github.com/znetstar/encode-cli).

## Examples
Encoding a Buffer as base64url

```javascript
  let enc = new EncodeTools();
  let buf = Buffer.from('hello world', 'utf8');
  let newBuf = enc.encodeBuffer(buf, BinaryEncoding.base64url);
  console.log(newBuf.toString('utf8'));
```

Hashing an object wth xxhash
```javascript
let enc = new EncodeTools();
let obj = { foo: 'bar' };
let newBuf = await enc.hashObject(obj, HashAlgorithm.xxhash64);
console.log(newBuf.toString('utf8'));
```

Serializing an object wth msgpack
```javascript
let enc = new EncodeTools();
let obj = { foo: 'bar' };
let newBuf = await enc.serializeObject(obj, SerializationFormat.msgpack);
console.log(newBuf.toString('base64'));
```

Generating a base64-encoded UUID v4
```javascript
let enc = new EncodeTools();
let newBuf = await enc.uniqueId(IDFormat.uuidv4);
console.log(newBuf.toString('base64'));
```


Compressing a buffer with lzma
```javascript
let enc = new EncodeTools();
let newBuf = await enc.compress(Buffer.from('hi', 'utf8'), CompressionFormat.lzma);
console.log(newBuf.toString('base64'));
```

Resizing a png image
```javascript
let enc = new EncodeTools();
let imageBuf = await (await new Promise((resolve, reject) => {
  new (Jimp)(500, 500, '#FFFFFF', (err: unknown, image: any) => {
    if (err) reject(err);
    else resolve(image);
  });
})).getBufferAsync('image/png');

let myResizedPng = await enc.resizeImage(imageBuf, { width: 250 }, ImageFormat.png);
```


## Algorithms

Below are a list of supported algorithms, their backing library, and their support in the browser.

### Binary Encoding

| Name            | Browser? | Underlying Package |
|-----------------|----------|--------------------|
| nodeBuffer      | ✓        | buffer/(built-in)  |
| base64          | ✓        | (built-in)         |
| base64url       | ✓        | (built-in)         |
| hex             | ✓        | (built-in)         |
| base32          | ✓        | base32.js          |
| hashids         | ✓        | hashids            |
| arrayBuffer     | ✓        | (built-in)         |
| base85 (ascii85)| ✓        | base85             |
| ascii85         | ✓        | base85             |

### Hashing
| Name     | Browser? | Underlying Package     |
|----------|----------|------------------------|
| crc32    | ✓        | hash-wasm              |
| xxhash3  |          | xxhash-addon           |
| xxhash64 | ✓        | xxhash-addon/hash-wasm |
| xxhash32 | ✓        | xxhash-addon/hash-wasm |
| md5      | ✓        | hash-wasm              |
| sha1     | ✓        | hash-wasm              |
| sha2     | ✓        | hash-wasm              |
| sha3     | ✓        | hash-wasm              |
| bcrypt   | ✓        | hash-wasm              |

### ID Generation

| Name         | Browser? | Underlying Package |
|--------------|----------|--------------------|
| uuidv4       | ✓        | uuid               |
| uuidv2       | ✓        | uuid               |
| uuidv4string | ✓        | uuid               |
| uuidv2string | ✓        | uuid               |
| objectId     | ✓        | bson-ext/bson      |
| nanoid       | ✓        | nanoid             |
| timestamp    | ✓        | (built in)         |

### Serialization

| Name    | Browser? | Underlying Package |
|---------|----------|--------------------|
| json    | ✓        | (built in)         |
| cbor    | ✓        | cbor/cbor-web      |
| msgpack | ✓        | @msgpack/msgpack   |
| bson    | ✓        | bson-ext/bson      |

### Compression

| Name    | Browser? | Underlying Package |
|---------|----------|--------------------|
| zstd    | ✓        | zstd-codec         |
| lzma    | ✓        | lzma/lzma-native   |

### Image Manipulation

| Name    | Browser? | Underlying Package |
|---------|----------|--------------------|
| png     | ✓        | jimp/sharp         |
| jpeg    | ✓        | jimp/sharp         |
| webp    |          | sharp              |
| avif    |          | sharp              |
| tiff    |          | sharp              |
| gif*    |          | sharp              |

## Requirements

Etomon Encode Tools runs in the browser and in node.js, with a few exceptions. The `bson-ext`, `lzma-native`, `xxhash-addon` and `cbor-extract` packages have native bindings, and so cannot run in the browser. For browser compatibility, the `EncodeTools` class uses the pure javascript `bson`, `lzma`, `hash-wsam`, and `cbor-x` packages, respectively,  to provide equivalent support albeit at the cost of performance. Additionally, `hash-wsam` lacks support for xxhash3.

The `EncodeToolsAuto` class will use the native packages `bson-ext`, `lzma-native` and `xxhash-addon` (and any future native packages). `bson-ext`, `lzma-native` and `xxhash-addon` are listed as optional dependencies, and NPM will attempt to install them automatically. 

The constructor of `EncodeToolsAuto` takes a second set of default `EncodingOptions` to use as a fallback if it cannot
find the needed module.

```javascript
const enc = new EncodeToolsAuto({ hashAlgorithm: HashAlgorithm.xxhash3 }, { hashAlgorithm: HashAlgorithm.xxhash64 });
if (enc.availableNativeModules.xxhashAddon)
    console.log('should be xxhash3', await enc.hashString('Test'));
else
    console.log('should be xxhash64', await enc.hashString('Test'));
```

The `gif` image format in `EncodeToolsAuto` requires `libvips` compiled with ImageMagick support ([as described here](https://zb.gy/qPJH)). I haven't had time to re-build libvips on my machine, so there are no mocha tests for the `gif` format.

## Usage

Please see the documentation located at https://etomonusa.github.io/encode-tools/

## Webpack

For issues with Webpack, try adding all the native dependencies to the `externals` section.

```javascript
{
  externals: {
      'xxhash-addon': 'commonjs xxhash-addon',
      'bson-ext': 'commonjs bson-ext',
      'shelljs': 'commonjs shelljs',
      'lzma-native': 'commonjs lzma-native',
      'sharp': 'commonjs sharp'
  },
  // For Webpack 5+ only, add `node-polyfill-webpack-plugin`
  plugins: [
    new (require('node-polyfill-webpack-plugin'))()
  ]
}
```

## Next.js

For Next.js, you can insert into `next.config.js`
```javascript
{
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false
      }
      config.externals = {
        ...config.externals,
        'xxhash-addon': 'commonjs xxhash-addon',
        'bson-ext': 'commonjs bson-ext',
        'shelljs': 'commonjs shelljs',
        'lzma-native': 'commonjs lzma-native',
        'sharp': 'commonjs sharp'
      }
      config.plugins = [
        ...config.plugins,
        new (require('node-polyfill-webpack-plugin'))()
      ]
    }
    return config;
  }
}
```

## Tests

Tests are written in Mocha, to run use `npm test`.

## License

Etomon Encode Tools is licensed under the GNU LGPL-3.0, a copy of which can be found at [https://www.gnu.org/licenses/](https://www.gnu.org/licenses/).
