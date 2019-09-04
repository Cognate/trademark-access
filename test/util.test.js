const expect = require('chai').expect;
require('mocha');
const Util = require('../src/util');
const fs = require('fs');

describe('isAddress', () => {
  it('accepts uppercase', () => {
    expect(Util.isAddress('0x1234567890ABCDEF1234567890ABCDEF12345678')).to.equal(true);
  });

  it('accepts lower case', () => {
    expect(Util.isAddress('0x1234567890abcdef1234567890abcdef12345678')).to.equal(true);
  });

  it('rejects invalid characters', () => {
    expect(Util.isAddress('0x1234567890gggggg1234567890gggggg12345678')).to.equal(false);
  });

  it('rejects too long', () => {
    expect(Util.isAddress('0x1234567890abcdef1234567890abcdef123456789')).to.equal(false);
  });

  it('rejects too short', () => {
    expect(Util.isAddress('0x1234567890abcdef1234567890abcdef1234567')).to.equal(false);
  });

  it('rejects empty', () => {
    expect(Util.isAddress('')).to.equal(false);
  });

  it('rejects undefined', () => {
    expect(Util.isAddress(undefined)).to.equal(false);
  });

  it(`rejects no leading '0x'`, () => {
    expect(Util.isAddress('1234567890abcdef1234567890abcdef12345678')).to.equal(false);
  });
});

describe('sha256', () => {
  it('generates a SHA for some data', () => {
    const expected = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
    expect(Util.sha256('Hello World')).to.equal(expected);
  });

  it('generates a SHA for an image', () => {
    const file = fs.readFileSync('./test/cognate.png');
    const expected = '24dd0edca4e231c08ebacda007e517b56d48a52dcf493febdf36959703558650';
    expect(Util.sha256(file)).to.equal(expected);
  });

  it('generates a SHA for a URL');

  it(`ignores ''`, () => {
    expect(Util.sha256('')).to.be.undefined;
  });

  it('ignores undefined', () => {
    expect(Util.sha256(undefined)).to.be.undefined;
  });
});
