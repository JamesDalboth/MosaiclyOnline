const Jimp = require('jimp');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  region: 'us-east-1'
});

const COLOURS = [
  {
    r: 200,
    g: 0,
    b: 0,
    name: 'red'
  },
  {
    r: 255,
    g: 190,
    b: -3,
    name: 'orange'
  },
  {
    r: 255,
    g: 255,
    b: -3,
    name: 'yellow'
  },
  {
    r: 0,
    g: 200,
    b: 0,
    name: 'green'
  },
  {
    r: -1,
    g: 255,
    b: 255,
    name: 'teal'
  },
  {
    r: 0,
    g: 0,
    b: 200,
    name: 'blue'
  },
  {
    r: 100,
    g: -2,
    b: 200,
    name: 'purple'
  },
  {
    r: 255,
    g: -2,
    b: 255,
    name: 'pink'
  },
  {
    r: 255,
    g: 255,
    b: 255,
    name: 'white'
  },
  {
    r: 126,
    g: 126,
    b: 126,
    name: 'grey'
  },
  {
    r: 204,
    g: 204,
    b: 0,
    name: 'brown'
  },
  {
    r: 0,
    g: 0,
    b: 0,
    name: 'black'
  }
];

exports.handler = (event, context, callback) => {
  const details = {
    imageUrl: event.imageUrl,
    searchTerm: event.searchTerm,
    tileSize: 10
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

  const roundedWidth = Math.floor(imageWidth / tileSize);
  const roundedHeight = Math.floor(imageHeight / tileSize);

  const newImage = image.clone();
  newImage.resize(roundedWidth * tileSize, roundedHeight * tileSize);
  image.resize(roundedWidth, roundedHeight, Jimp.RESIZE_NEAREST_NEIGHBOR);

  for (let x = 0; x < roundedWidth; x += 1) {
    for (let y = 0; y < roundedHeight; y += 1) {
      await processSection(image, newImage, x, y, tileSize, mapping);
    }
  }

  console.log("Full Image Processed");
  return newImage;
};

const processSection = async (image, newImage, x, y, tileSize, mapping) => {
  const i = image.getPixelIndex(x, y);

  const average = {
    r: image.bitmap.data[i + 0],
    g: image.bitmap.data[i + 1],
    b: image.bitmap.data[i + 2]
  };

  console.log("(r, g, b): " + average.r + ", " + average.g + ", " + average.b);
  const closestColour = getClosestColour(average);
  console.log(closestColour);

  let col;
  for (let colour of COLOURS) {
    if (colour.name == closestColour) {
      col = colour;
    }
  }

  newImage.scan(x * tileSize, y * tileSize, tileSize, tileSize, (px, py, i) => {
    newImage.bitmap.data[i + 0] = getColourVal(average, col.r);
    newImage.bitmap.data[i + 1] = getColourVal(average, col.g);
    newImage.bitmap.data[i + 2] = getColourVal(average, col.b);
  });
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
      return 'grey';
    } else {
      if (maxInt > 185) {
        return 'white';
      }
      return 'grey';
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

const getColourVal = (base, val) => {
  if (val == -1) {
    return base.r;
  }

  if (val == -2) {
    return base.g;
  }

  if (val == -3) {
    return base.b;
  }

  return val;
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
