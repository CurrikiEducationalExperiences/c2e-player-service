const axios = require('axios');
const {PlatformSetting} = require('../models/platformSetting');

async function stream(req, res, next) {
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

  const { ceeId } = req.query;
  const params = {
    ceeId: ceeId,
    email: platformSettings.cee_licensee_id,
    secret: platformSettings.cee_secret_key,
    decrypt: true
  };
  const options = {
    method: 'POST',
    responseType: 'stream'
  };
  const fileUrl = `${platformSettings.cee_provider_url}/c2e/licensed`;
  try {
    const response = await axios.post(fileUrl, params, options);
    const fileStream = response.data;
    const fileName = `${ceeId}.c2e`;
    const fileMime = 'application/zip';
    const fileLength = response.headers['content-length'];
    const headers = {
      'Content-Type': fileMime,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fileLength
    };
    res.writeHead(200, headers);
    fileStream.pipe(res);
  } catch (e) {
    return res.status(400).send({
      status: 400,
      error: "Failed to stream file",
      details: {
        description: "Could not stream C2E content. Please check your licensee settings and query params",
        message: "Failed to stream file"
      }
    });
  }
}

module.exports = {
    stream
};