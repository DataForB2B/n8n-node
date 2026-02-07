module.exports = {
  nodes: [
    require('./dist/nodes/DataForB2B/DataForB2B.node.js'),
  ],
  credentials: [
    require('./dist/credentials/DataForB2BApi.credentials.js'),
  ],
};
