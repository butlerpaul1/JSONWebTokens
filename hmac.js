/** This script creates HTTP Headers for Authorization for HMAC */
const crypto = require('crypto');
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  { name: 'accesskey', alias: 'a', type: String },
  { name: 'secret', alias: 's', type: String },
  { name: 'url', alias: 'u', type: String },
  { name: 'httpbody', alias: 'b', type: String }
]


const options = commandLineArgs(optionDefinitions)
const accesskey = options.accesskey;
const secret = options.secret;
const url = options.url;
const body = options.httpbody;

let signature = null;
if (body === undefined) {
  signature = crypto.createHmac('sha256', secret).update(url + accesskey).digest('hex');
} else {
  signature = crypto.createHmac('sha256', secret).update(body + url + accesskey).digest('hex');
}
console.log(`Authorization: HMAC-SHA256 Key=${accesskey} Signature=${signature}`)
