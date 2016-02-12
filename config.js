module.exports = {
  // this is the port our node will listen, if not specified it will pick one on random
  port: process.env.PORT,
  // this is the location to persist peers list
  nodesStorage: __dirname+'/nodes.json',
};
