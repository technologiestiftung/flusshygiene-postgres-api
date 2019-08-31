jest.mock('aws-sdk');
module.exports = async () => {
  jest.setTimeout(20000);
  console.log('setup after env');
};
