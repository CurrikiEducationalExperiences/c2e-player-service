const axios = require('axios');
const xapiServiceUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/xapi`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;

async function xapi(req, res) {
    if (!req.body.id || !req.body.verb)
        return res.status(400).send('No xAPI statement provided.');

    const params = {
        statement: JSON.stringify(req.body),
        email: apiUser,
        secret: apiSecret
    };

    await axios.post(xapiServiceUrl, params)
    .then(async (response) => {
        return res.send(response.data);
    })
    .catch((error) => {
        console.log(error);
        res.send({error: 'Error: Failed to send  xAPI statement to service provider'});
    });
}

module.exports = {
    xapi
};