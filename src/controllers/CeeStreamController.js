const axios = require('axios');
const fileUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/c2e/licensed`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;

async function stream(req, res, next) {
  const { ceeId } = req.query;
  const params = {
    ceeId: ceeId,
    email: apiUser,
    secret: apiSecret,
    decrypt: true
  };
  const options = {
    method: 'POST',
    responseType: 'stream'
  };
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