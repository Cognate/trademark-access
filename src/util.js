const crypto = require('crypto');
const addressPattern = /^0x[a-fA-F0-9]{40}$/;

function isAddress(address) {
  if (!address) {
    return false;
  }
  return addressPattern.test(address);
}

function sha256(data) {
  if (!data) {
    return undefined;
  }
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

module.exports.isAddress = isAddress;
module.exports.sha256 = sha256;
