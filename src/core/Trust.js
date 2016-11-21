import {d, multihash, run} from 'lightsaber'
import fs from 'fs'
const jsonldSignatures = require('jsonld-signatures')
import bitcore from 'bitcore-lib'
import canonicalJson from 'json-stable-stringify'
import moment from 'moment'

export default class Trust {
  claim = (opts) => {
    const claim = {
      '@context': 'https://trust.exchange/schemas/TrustClaim.jsonld',
      // id: multihash of json of final signed claim??? add at end.
      type: ['Verifiable Claim', 'Rating'],
      issuer: opts.creator,
      issued: moment().format(),
      claim: {
        '@context': 'https://trust.exchange/schemas/GeneralRating.jsonld',
        type: ['GeneralRating'],
        // id: ???
        target: opts.target,
        rating: {
          '@context': 'http://schema.org',
          type: ['Rating'],
          // id: ???
          author: opts.creator,
          bestRating: 1,
          worstRating: 0,
          ratingValue: opts.value,
          description: opts.description,
        }
      }
    }

    d('\ninput:')
    d(JSON.stringify(claim, null, 4))

    let result
    jsonldSignatures.promises.sign(claim, {
      privateKeyWif: opts.privateKey,
      algorithm: 'sha256-ecdsa-secp256k1-2016',
      domain: 'example.com',
      creator: 'sha256-ecdsa-secp256k1-public-key:' + new bitcore.PrivateKey(opts.privateKey).toPublicKey()
    }).then(function (_result) {
      result = _result
      d('\n\nsigned json:')
      d(result)
      const json = canonicalJson(result)
      d('\n\ncanonical json to timestamp:')
      d(json)
      d('\n\nmultihash:')
      d(multihash(json))
      run('mkdir -p claims')
      fs.writeFileSync('claims/xyz', canonicalJson(result))
      const id = run('ipfs add -q claims/xyz').toString().trim()
      d('open https://ipfs.io/ipfs/' + id)
      return
    }).catch(function (error) {
      console.error(error.stack)
      process.exit(1)
    })
  }

  get = () => d('TODO: implement this')

}