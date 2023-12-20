const axios = require('axios');
const {PlatformSetting} = require('../models/platformSetting');

async function xapi(req, res) {
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

    if (!req.body.id || !req.body.verb){
        return res.status(400).send({
            status: 400,
            error: "No xAPI statement provided",
            details: {
              description: "The request params provided do not match a valid xAPI statement format",
              message: "No xAPI statement provided"
            }
        });
    }

    const params = {
        statement: JSON.stringify(req.body),
        email: platformSettings.cee_licensee_id,
        secret: platformSettings.cee_secret_key,
    };

    const xapiServiceUrl = `${platformSettings.cee_provider_url}/xapi`;
    await axios.post(xapiServiceUrl, params)
    .then(async (response) => {
        return res.send(response.data);
    })
    .catch((error) => {
        console.log(error);
        return res.status(400).send({
            status: 400,
            error: "Failed to send  xAPI statement to service provider",
            details: {
              description: "Failed to send  xAPI statement to service provider. Check your integration settings",
              message: "Failed to send  xAPI statement to service provider"
            }
        });
    });
}

module.exports = {
    xapi
};