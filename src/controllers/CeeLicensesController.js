const axios = require('axios');
const {PlatformSetting} = require('../models/platformSetting');

async function licenses(req, res, next) {
  const { page = 1, limit = 10, query = '' } = req.query;

  if (isNaN(parseInt(page)) || isNaN(parseInt(limit)) || typeof query !== 'string') {
    return res.status(400).send('Invalid parameter type');
  }

  const platformSettings = await PlatformSetting.findOne({ where: {lti_client_id: res.locals.token.clientId}});
  if (!platformSettings) {
    return res.status(400).send('No matching platform settings found.');
  }

  const licensesUrl = `${platformSettings.cee_provider_url}/licenses`;
  const params = {
    page,
    limit: 9000,
    query,
    email: platformSettings.cee_licensee_id,
    secret: platformSettings.cee_secret_key
  };

  await axios.get(licensesUrl, {params})
  .then(async (response) => {
    return res.send(response.data);
  })
  .catch((error) => {
    res.send(error);
  });
}

module.exports = {
  licenses
};