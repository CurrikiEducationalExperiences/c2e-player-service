const axios = require('axios');
const licensesUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/licenses`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;

async function licenses(req, res, next) {
  const { page = 1, limit = 10, query = '' } = req.query;

  if (typeof page !== 'number' || typeof limit !== 'number' || typeof query !== 'string') {
    return res.status(400).send('Invalid parameter type');
  }

  const params = {
    page,
    limit,
    query,
    email: apiUser,
    secret: apiSecret
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