# Trademark Access

This repository is used to access Cognate trademark data on the Ethereum network. If you
were not a previous Cognate customer there is probably is not much of value here for you.
The purpose of this repository is give previous Cognate customers a one stop and simple
means of accessing their trademark data on Ethereum. This will produce an exhaustive set
of all data pertaining to a trademark's timeline including words and designs, proofs,
timestamps.

## Pulling Data

TODO: how to pull the data specifically.

## Data Format

The raw data is constructed into several objects.

### Trademark

| Property | Required | Source | Description | Example |
|----------|----------|--------|-------------|---------|
| address | yes | Ethereum | The Ethereum address of this trademark. | 0xb35d271ffbd783ffb6ccb227b932298e03e15f24 |
| deprecatedDesignLocation | no | Ethereum | The original location of the design image, which may now be gone. | `{URL}` |
| design | no | Ethereum | A SHA-256 hash representation of the image data at the time of creation. | 0xf54f3b87eda462770230d060fce9b9f4876cb68fe8cd38d14c00356bcff7d690 |
| migratedLocation | no | Code | An adjusted URL to match where the original design images were migrated into this git repository. | `{URL}` |
| timeline | no  | Ethereum | The timeline of claims and proofs for this trademark. | `{Object}` | 
| timestamp | yes  | Ethereum | The unix timestamp of this trademark in Ethereum. | 1523899114 |
| word | no | Ethereum | The word definition of the trademark. | `{String}` |

### Timeline

| Property | Required | Source | Description | Example |
|----------|----------|--------|-------------|---------|
| address | yes | Ethereum | The Ethereum address of this timeline. | 0xe0679701c5c4258a4f6374acc7d384fe6b0c9308 |
| documents | yes | Ethereum | A list of claims and proofs for this timeline | `Array[{Object}]` |

#### Area of Use - Classification - Proof of Use

| Property | Type | Required | Source | Description | Example |
|----------|------|----------|--------|-------------|---------|
| address | All | yes | Ethereum | The Ethereum address of this timeline document | 0x6f448da05f23ddc79f3ff1f8f5bd7fa3528ce255 |
| classOfGoods | Classification | yes | Ethereum | The classification code claimed | `{Integer}` |
| company | Assignment | no | Ethereum | The company of the claiming party. | `{String}` |
| countries | AreaOfUse | yes | Ethereum | A list of countries where this trademark was claimed | `Array[{String}]` |
| deprecatedLocation | ProofOfUse | yes | Ethereum | The original location of the proof image, which may now be gone. | `{URL}` |
| details | Classification | yes | Ethereum | The identification claimed | `{String}` |
| firstName | Assignment | no | Ethereum | The first name of the claiming party. | `{String}` |
| hash | ProofOfUse | yes | Ethereum | A SHA-256 hash representation of the image data at the time of creation. | 0x9ba2cf7c95c37e2bb2670f7f8b213775379bd089df4ba1919164b25f14a6df30 |
| lastName | Assignment | no | Ethereum | The last name of the claiming party. | `{String}` |
| regions | AreaOfUse | no | Ethereum | A list of US states where this trademark was claimed | `Array[{String}]` |
| timestamp | All | yes | Ethereum | The unix timestamp of this trademark in Ethereum. | 1523899114 |
| type | all | yes | Ethereum | The type of timeline document this is | `AreaOfUse`, `Assignment`, `Classification`, `ProofOfUse` |

# Development

This project was tested with Node 10.

## Building

* clone this repo
* `npm install` - installs all the dependencies
* `npm test` - executes the tests
* `node src/cli.js` - executes the script; arguments required
