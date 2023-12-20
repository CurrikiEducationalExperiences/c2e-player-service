const axios = require('axios');
const {PlatformSetting} = require('../models/platformSetting');

async function licenses(req, res, next) {
  const { page = 1, limit = 10, query = '' } = req.query;

  if (isNaN(parseInt(page)) || isNaN(parseInt(limit)) || typeof query !== 'string') {
    return res.status(400).send({
      status: 400,
      error: "Invalid parameter type",
      details: {
        description: "The query params provided are not formatted properly",
        message: "Invalid parameter type"
      }
    });
  }

  var platformSettings = await PlatformSetting.findOne({ where: {lti_client_id: res.locals.token.clientId}});
  if (!platformSettings) {
    return res.status(400).send({
      status: 400,
      error: "No matching platform settings found",
      details: {
        description: "Your LTI authentication information doesn't match any existing platform settings in the C2E player",
        message: "No matching platform settings found"
      }
    });
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
    res.status(400).send({
      status: 400,
      error: "Failed to retrieve licenses",
      details: {
        description: "Failed to retrieve licenses. Please check your licensee settings",
        message: "Failed to retrieve licenses"
      }
    });
  });
}

module.exports = {
  licenses
};