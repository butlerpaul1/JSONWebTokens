const crypto = require('crypto');
const keygen = require("generate-key");
const secret = "$329239dksdkdjkw"
const auth = {}
var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/postgres');


const response = (status, message, data=undefined) => {
  return { status, message, data };
}

/**
 * Guards endpoint using HMAC Authentication.
 */
auth.guardEndpointHMAC = (req, res, next) => {
  const authorization = req.headers['authorization'];
  const components = auth.parseHMACHeader(authorization);
  const access_key = components.key;
  const clientSignature = components.signature;
  const query = 'select secret_key from users where access_key = :access_key';
  sequelize.query(query, { replacements: { access_key }})
    .then(result => {
      if (result[0].length == 0) {
        res
          .status(401)
          .json(response('Failed', 'Failed Authentication'))
      } else {
        const secret_key = result[0][0].secret_key;
        let serverSignature;

        if (req.body === {}) { // check if body exists.
          serverSignature =
          crypto.createHmac("sha256", secret_key)
            .update(String(req.body) + req.url + access_key)
            .digest("hex");
        } else {
          serverSignature =
          crypto.createHmac("sha256", secret_key)
            .update(req.url + access_key)
            .digest("hex");
        }
        if (clientSignature === serverSignature) {
          next();
        } else {
          res
            .status(401)
            .json(response('Failed', 'Failed Authentication'))
        }
      }
    });
}

auth.parseHMACHeader = (header) => {
  const components = header.split(' ');
  const key = components[1].replace('Key=', '');
  const signature = components[2].replace('Signature=', '');
  return { key, signature };
}

auth.keyGen = (bits) => { return keygen.generateKey(bits/16);};


module.exports = auth;
