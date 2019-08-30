const expect = require('chai').expect;
require('mocha');
const Trademark = require('../src/trademark');

describe('Pulling Trademarks from Ethereum', () => {
  describe('V4 Contracts', () => {
    it('Word', async () => {
      // listing id 1024571
      // TODO: this doesnt seem right
      await assertTrademark({
        address: '0x032b847a8ced9ccd63c02853ebb4ac6588156eaf',
        timeline: {
          address: '0x3304e5d6a47678b29d2ce34a863b11b4c9ce8e55',
          documents: [
            {
              address: '0x032b847a8ced9ccd63c02853ebb4ac6588156eaf',
              hash: '0x34684ded799294c0ded938f4ab5f0dce1faa867ed827ba37832c5fc06abf4af5',
              location: 'https://s3.amazonaws.com/cog-usage-documents/5234/5239',
              timestamp: 1536602333,
              type: 'ProofOfUse',
            },
            {
              address: '0xce75fded98ce98fed2753cf49dad80cd32cb1838',
              countries: 'CA',
              timestamp: 1536602464,
              type: 'AreaOfUse',
            },
            {
              address: '0xd96e607eabb0d569989e569e6d12efedf23a3b0b',
              classOfGoods: '35',
              details:
                'Advertising services, namely, creating corporate and brand identity for others|Business management consulting with relation to strategy, marketing, production, personnel and retail sale matters',
              timestamp: 1536602559,
              type: 'Classification',
            },
            {
              address: '0x7b0ea23bcf259c21ed2a7fc2afee50e259f9f488',
              hash: '0xe75749c987abf89b77c413151d5c27416577bb882623887ee663ad152e5dcbcf',
              location: 'https://s3.amazonaws.com/cog-usage-documents/L1024571/P5382',
              timestamp: 1536602849,
              type: 'ProofOfUse',
            },
          ],
        },
        timestamp: 1536602333,
        word: 'Nextrue',
      });
    });

    it.only('Word2', async () => {
      // listing id 1024725
      await assertTrademark({
        address: '0x68b122d62d3d2e4dbbcb7c49e805d4b2dd4df8cd',
        timeline: {
          address: '0x479f6b8f9d33b94535e5936619f0cd1f24b2b96a',
          documents: [
            {
              address: '0x68b122d62d3d2e4dbbcb7c49e805d4b2dd4df8cd',
              hash: '0x99362a2d31acbd08d9d51a925384b1af5f13b70e71c7c04cc85a22c3f87d12c9',
              location: 'https://s3.amazonaws.com/cog-usage-documents/L1024725/P5405',
              timestamp: 1536597754,
              type: 'ProofOfUse',
            },
          ],
        },
        timestamp: 1536597754,
        word: 'Wellness KPI',
      });
    });

    it('Word (initial)');

    it('Design');

    it('Design (initial)');

    it('Word and Design');

    it('Word and Design (initial)');
  });

  describe('V3 Contracts', () => {
    it('Word', async () => {
      // listing id 1018939
      await assertTrademark({
        address: '0xb35d271ffbd783ffb6ccb227b932298e03e15f24',
        timeline: {
          address: '0x377ba5e83d6f41d4d6fc8027dc75b034d910ff48',
          documents: [
            {
              address: '0x874ff1e64c1be0a9f04ac3c839bee3d03d0a6311',
              companyName: 'Cognate, Inc.',
              firstName: 'Test',
              lastName: 'Account',
              timestamp: 1523903446,
              type: 'Assignment',
            },
            {
              address: '0xa9f3e783bacc7260ad1330cf3f4a050a58cbbac6',
              countries: 'GB,US',
              regions:
                'CT,MA,ME,NH,RI,VT,NJ,NY,DC,DE,MD,PA,VA,WV,AL,FL,GA,KY,MS,NC,SC,TN,IL,IN,MI,MN,OH,WI,AR,LA,NM,OK,TX,IA,KS,MO,NE,CO,MT,ND,SD,UT,WY,AZ,CA,HI,NV,AK,ID,OR,WA',
              timestamp: 1523904415,
              type: 'AreaOfUse',
            },
            {
              address: '0xb5b14dedb6112478a1f036014c17bff9c88d5fba',
              classOfGoods: '45',
              details:
                'Domain name registrar services|Registration of domain names for identification of users on a global computer network [legal service]|Trademark Monitoring',
              timestamp: 1523905206,
              type: 'Classification',
            },
            {
              address: '0x1f427bf99b504ccb6a6c76d743238359028fc4fc',
              hash: '0x6abc38ef9586c9f5b4b75fffc0cd96b60c58cf302415359fb08589dec5dfb8a4',
              location: 'https://s3.amazonaws.com/cog-usage-documents/177/177',
              timestamp: 1523905695,
              type: 'ProofOfUse',
            },
            {
              address: '0x26912d2871704202aae90c46f919c22723b45ffd',
              hash: '0x1e3db66dc68727e760392bf7e6aeee18687a521b768eba0268fe8bbc9bad5eb3',
              location: 'https://s3.amazonaws.com/cog-usage-documents/218/218',
              timestamp: 1523906494,
              type: 'ProofOfUse',
            },
          ],
        },
        timestamp: 1523899114,
        word: 'Cognate',
      });
    });

    it('Design', async () => {
      // listing id 1021806
      await assertTrademark({
        address: '0xca6823878b5fc9390c21c652405b000e1daa734f',
        design: '0xf54f3b87eda462770230d060fce9b9f4876cb68fe8cd38d14c00356bcff7d690',
        designLocation: 'TODO',
        timeline: {
          address: '0xe0679701c5c4258a4f6374acc7d384fe6b0c9308',
          documents: [
            {
              address: '0x6f448da05f23ddc79f3ff1f8f5bd7fa3528ce255',
              countries: 'AU,CA,DE,ES,FR,IE,IN,NL,RU,US',
              regions:
                'CT,MA,ME,NH,RI,VT,NJ,NY,DC,DE,MD,PA,VA,WV,AL,FL,GA,KY,MS,NC,SC,TN,IL,IN,MI,MN,OH,WI,AR,LA,NM,OK,TX,IA,KS,MO,NE,CO,MT,ND,SD,UT,WY,AZ,CA,HI,NV,AK,ID,OR,WA',
              timestamp: 1523904097,
              type: 'AreaOfUse',
            },
            {
              address: '0xa7daef1f0e99d7193bab32c9a5309919e60803b1',
              classOfGoods: '45',
              details:
                'Authentication, issuance and validation of digital certificates|Legal services, namely, trademark maintenance services',
              timestamp: 1523904877,
              type: 'Classification',
            },
            {
              address: '0x87eb5999771af7c700640acd755434ac186a23da',
              hash: '0x907f585ce27cafb16bc307245f2c022f67bd3f90beedb3c71ed04bbeff25de20',
              location: 'https://s3.amazonaws.com/cog-usage-documents/2563/2561',
              timestamp: 1523905612,
              type: 'ProofOfUse',
            },
          ],
        },
        timestamp: 1523902346,
      });
    });

    it('Word and Design');
  });

  describe('V2 Contracts', () => {
    it('Word');

    it('Design');

    it('Word and Design', async () => {
      // listing id 1018840
      await assertTrademark({
        address: '0xa2a423a147ef2fe82f4613227f8c576fe635ec9b',
        design: '0xd0470b0caabac1bed10bf1f958d14117f8996a85d4caaa8c3fc363994180b414',
        designLocation: 'TODO',
        word: 'COGNATE',
      });
    });
  });

  async function assertTrademark(expected) {
    const actual = await Trademark.getTrademark(expected.address);
    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  }
});
