const Jimp = require('jimp');
const AWS = require('aws-sdk');

const request = require('request-promise');

Jimp.appendConstructorOption(
  'Timeout',
  options => options.timeoutUrl,
  function(resolve, reject, options) {
    request({
      url: options.timeoutUrl,
      encoding: null,
      timeout: 5000
    })
      .then((res) => {
        this.parseBitmap(res, options.timeoutUrl, err => {
          if (err) {
            console.error(err);
            reject(err);
          }

          resolve();
        });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  }
);

const s3 = new AWS.S3();
const lambda = new AWS.Lambda({
  region: 'us-east-1'
});

exports.handler = (event, context, callback) => {
  const details = {
    data: event.data,
    searchTerm: event.searchTerm,
    tileSize: event.tileSize,
    colourAdjustment: event.colourAdjustment
  };

  if (!details.data || !details.searchTerm || !details.tileSize) {
    callback('Missing event details (data, searchTerm, tileSize)');
    return;
  }

  uploadS3(details.data)
    .then((url) => Jimp.read(url))
    .then((image) => {
      details.image = image;
    })
    .then(() => invokeSearchScrapper(details.searchTerm, details.tileSize))
    .then((mapping) => processImage(details.image, details.tileSize, mapping, details.colourAdjustment))
    .then((processedImage) => encodeImage(processedImage))
    .then((base64) => uploadS3(base64))
    .then((url) => callback(null, url))
    .catch((err) => callback(err));
};

const processImage = async (image, tileSize, mapping, colourAdjustment) => {
  const imageWidth = image.bitmap.width;
  const imageHeight = image.bitmap.height;

  const roundedWidth = Math.floor(imageWidth / tileSize);
  const roundedHeight = Math.floor(imageHeight / tileSize);

  const newImage = image.clone();
  newImage.resize(roundedWidth * tileSize, roundedHeight * tileSize);
  image.resize(roundedWidth, roundedHeight, Jimp.RESIZE_NEAREST_NEIGHBOR);

  console.log("Beginning to process image");

  for (let x = 0; x < roundedWidth; x += 1) {
    for (let y = 0; y < roundedHeight; y += 1) {
      await processSection(image, newImage, x, y, tileSize, mapping, colourAdjustment);
    }
  }

  console.log("Full Image Processed");
  return newImage;
};

const processSection = async (image, newImage, x, y, tileSize, mapping, colourAdjustment) => {
  const i = image.getPixelIndex(x, y);

  const average = {
    r: image.bitmap.data[i + 0],
    g: image.bitmap.data[i + 1],
    b: image.bitmap.data[i + 2]
  };

  const rHex = average.r.toString(16);
  const gHex = average.g.toString(16);
  const bHex = average.b.toString(16);

  const averageHex = '#' + rHex + gHex + bHex;

  const closestColour = getClosestColour(average);

  const closestImg = mapping[closestColour][Math.floor(Math.random() * mapping[closestColour].length)];

  if (closestImg == null) {
    console.error("Failed to get tile for (x, y): " + x + ", " + y);
    return;
  }

  const tile = closestImg.clone();

  if (colourAdjustment) {
    tile.color([
      { apply: 'mix', params: [ averageHex, 50 ] }
    ]);
  }

  newImage.composite(tile, x * tileSize, y * tileSize);
};

const invokeSearchScrapper = async (searchTerm, tileSize) => {
  return lambda.invoke({
    FunctionName: 'Mosaicly_SearchScrapper',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      searchTerm: searchTerm
    })
  })
    .promise()
    .then((data) => {
      console.log("Response from Mosaicly_SearchScrapper:");
      console.log(data);
      return data;
    })
    .then((response) => JSON.parse(response.Payload))
    .then((mapping) => Promise.all(mapping.map((colour) => colourObjUrlReplacement(colour, tileSize))))
    .then(reformatMapping);
};

const uploadS3 = async (data) => {
  const buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""),'base64');
  const filename = (Math.random() * 10000000) + '.png';
  return s3.putObject({
    Body: buf,
    Key: filename,
    ContentEncoding: 'base64',
    Bucket: 'mosaicly',
    ContentType: 'image/png',
    ACL:'public-read'
  }).promise()
  .then(() => 'https://mosaicly.s3.amazonaws.com/' + filename);
};

const encodeImage = (image) => {
  return image.getBase64Async(Jimp.MIME_PNG);
};

const getClosestColour = (base) => {
  const r = base.r / 255;
  const g = base.g / 255;
  const b = base.b / 255;

  const maxInt = Math.max(base.r, base.g, base.b);
  const minInt = Math.min(base.r, base.g, base.b);

  const maxDouble = Math.max(r, g, b);
  const minDouble = Math.min(r, g, b);

  let hue = 0;

  if (maxInt - minInt < 30) {
    if (maxInt < 127) {
      if (maxInt < 70) {
        return 'black';
      }
      return 'gray';
    } else {
      if (maxInt > 185) {
        return 'white';
      }
      return 'gray';
    }
  } else {
    if (maxDouble == r) {
      hue = g - b / (maxDouble - minDouble);
    } else if (maxDouble == g) {
      hue = 2 + (b - r) / (maxDouble - minDouble);
    } else {
      hue = 4 + (r - g) / maxDouble - minDouble;
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }

    if (hue <= 25) {
      return 'red';
    }
    if (hue <= 41) {
      return 'orange';
    }
    if (hue <= 69) {
      return 'yellow';
    }
    if (hue <= 166) {
      return 'green';
    }
    if (hue <= 190) {
      return 'teal';
    }
    if (hue <= 251) {
      return 'blue';
    }
    if (hue <= 295) {
      return 'purple';
    }
    if (hue <= 336) {
      return 'pink';
    }
    if (hue <= 360) {
      return 'red';
    }

    return 'white';
  }
};

const newImage = async (url, size) => {
  console.log("New Image: " + url);
  return Jimp.read({
      timeoutUrl: url
    })
    .then((image) => image.resize(size, size))
    .then((image) => image.opaque())
    .catch((err) => {
      console.error("Error loading new image " + url + " : " + err);
      return null;
    });
};

const colourObjUrlReplacement = async (colour, size) => {
  console.log("Converting urls to images for " + colour.color);
  return Promise.all(colour.data.map((url) => newImage(url, size)))
    .then((data) => data.filter((x) => x != null))
    .then((data) => {
      return {
        colour: colour.color,
        data: data
      };
    });
};

const reformatMapping = async (mapping) => {
  const newMapping = {};

  for (let entry of mapping) {
    newMapping[entry.colour] = entry.data;
  }

  return newMapping;
};
