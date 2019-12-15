const Jimp = require('jimp');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  region: 'us-east-1'
});


exports.handler = (event, context, callback) => {
  const details = {
    imageUrl: event.imageUrl,
    searchTerm: event.searchTerm,
    tileSize: 50
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
    .then((mapping) => processImage(details.image, details.tileSize, mapping))
    .then((processedImage) => encodeImage(processedImage))
    .then((base64) => callback(null, base64))
    .catch((err) => callback(err));
};

const processImage = async (image, tileSize, mapping) => {
  const imageWidth = image.bitmap.width;
  const imageHeight = image.bitmap.height;

  const roundedWidth = tileSize * Math.floor(imageWidth / tileSize);
  const roundedHeight = tileSize * Math.floor(imageHeight / tileSize);

  image = image.resize(roundedWidth, roundedHeight);

  for (let x = 0; x < roundedWidth; x += tileSize) {
    for (let y = 0; y < roundedHeight; y += tileSize) {
      processSection(image, x, y, tileSize, mapping);
    }
  }

  return image;
};

const processSection = async (image, x, y, tileSize, mapping) => {
  let redSquareSum = 0;
  let greenSquareSum = 0;
  let blueSquareSum = 0;

  let num = 0;

  image.scan(x, y, tileSize, tileSize, (px, py, i) => {
    redSquareSum += image.bitmap.data[i + 0] ** 2;
    greenSquareSum += image.bitmap.data[i + 1] ** 2;
    blueSquareSum += image.bitmap.data[i + 2] ** 2;

    num++;
  });

  const averageRed = Math.sqrt(redSquareSum / num);
  const averageGreen = Math.sqrt(greenSquareSum / num);
  const averageBlue = Math.sqrt(blueSquareSum / num);

  image.scan(x, y, tileSize, tileSize, (px, py, i) => {
    image.bitmap.data[i + 0] = averageRed;
    image.bitmap.data[i + 1] = averageGreen;
    image.bitmap.data[i + 2] = averageBlue;
  });
};

const invokeSearchScrapper = async (searchTerm) => {
  // return lambda.invoke({
  //   FunctionName: 'Mosaicly_SearchScrapper',
  //   InvocationType: 'RequestResponse',
  //   Payload: JSON.stringify({
  //     searchTerm: searchTerm
  //   })
  // }).promise();
  return {};
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
