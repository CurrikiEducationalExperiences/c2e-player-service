const lti = require('ltijs').Provider

async function register(req, res, next) {
  if (
    !req.body.url 
    || !req.body.name 
    || !req.body.clientId 
    || !req.body.authenticationEndpoint 
    || !req.body.accesstokenEndpoint 
    || !req.body.authConfigMethod 
    || !req.body.authConfigKey
  )
      return res.status(400).send('Invalid parameters.');

  const {
    url = '',
    name = '',
    clientId = 0,
    authenticationEndpoint = '',
    accesstokenEndpoint = '',
    authConfigMethod = '',
    authConfigKey = ''
  } = req.body;

  if (
    typeof url !== 'string'
    || typeof name !== 'string'
    || isNaN(parseInt(clientId))
    || typeof authenticationEndpoint !== 'string'
    || typeof accesstokenEndpoint !== 'string'
    || typeof authConfigMethod !== 'string'
    || typeof authConfigKey !== 'string'    
  ) {
    return res.status(400).send('Invalid parameter type');
  }

  await lti.registerPlatform({
    url: url,
    name: name,
    clientId: clientId,
    authenticationEndpoint: authenticationEndpoint,
    accesstokenEndpoint: accesstokenEndpoint,
    authConfig: {
      method: authConfigMethod,
      key: authConfigKey,
    },
  })
  .then(async (response) => {
    return res.status(200).send('Platform registered successfully.');
  })
  .catch((error) => {
      console.log(error);
      res.send({error: 'Error: Failed to register platform.'});
  });
}

module.exports = {
  register
};