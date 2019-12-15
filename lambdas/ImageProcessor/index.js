const Jimp = require('jimp');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  region: 'us-east-1'
});


exports.handler = (event, context, callback) => {
  const details = {
    imageUrl: event.imageUrl,
    searchTerm: event.searchTerm,
  };

  if (!details.imageUrl || !details.searchTerm) {
    callback('Missing event details');
    return;
  }


  Jimp.read(details.imageUrl)
    .then((image) => {
      details.image = image;
    })
    .then(() => invokeSearchScrapper(details.searchTerm))
    .then((mapping) => processImage(details.image, mapping))
    .then((processedImage) => encodeImage(processedImage))
    .then((base64) => callback(null, base64))
    .catch((err) => callback(err));
};

const processImage = async (image, mapping) => {
  console.log(mapping);
  return image;
};

const invokeSearchScrapper = async (searchTerm) => {
  return lambda.invoke({
    FunctionName: 'Mosaicly_SearchScrapper',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      searchTerm: searchTerm
    })
  }).promise();
};

const decodeBase64 = async (base64) => {
  return new Promise((resolve) => {
    console.log(base64);
    Base64Img.img(base64, '', 'decoded', (err, filepath) => {
      if (err) {
        throw err;
      }

      resolve(filepath);
    });
  });
};

const encodeImage = (image) => {
  return image.getBase64Async(Jimp.AUTO);
};
