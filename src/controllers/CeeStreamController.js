const axios = require('axios');
const {PlatformSetting} = require('../models/platformSetting');

async function stream(req, res, next) {
  var platformSettings = await PlatformSetting.findOne({ where: {lti_client_id: res.locals.token.clientId}});
  if (!platformSettings) {
    return res.status(400).send('No matching platform settings found.');
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
    console.log('CeeStreamController Error:', e);
    res.send({error: 'Failed to stream file'});
  }
}

module.exports = {
    stream
};