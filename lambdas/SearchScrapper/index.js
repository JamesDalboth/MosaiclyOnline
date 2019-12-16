const request = require('request-promise');

const COLOURS = [
  'red',
  'blue',
  'green',
  'orange',
  'yellow',
  'teal',
  'purple',
  'pink',
  'white',
  'gray',
  'black',
  'brown',
];

exports.handler = (event, context, callback) => {
  const searchTerm = event.searchTerm;

  if (!searchTerm) {
    callback('Missing Search Term');
    return;
  }

  Promise.all(COLOURS.map((color) => getImages(searchTerm, color)))
    .then((imageMap) => callback(null, imageMap))
    .catch((err) => {
      callback(err);
    });
};

const getImages = async (searchTerm, color) => {
  return buildEndpoint(searchTerm, color)
    .then((endpoint) => query(endpoint))
    .then((response) => parseResponse(response))
    .then((data) => {
      return {
        color: color,
        data: data,
      };
    });
};

const query = async (endpoint) => {
  const options = {
    url: endpoint,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY
    }
  };
  console.log('Querying ' + JSON.stringify(options));
  return request(options);
};

const parseResponse = (response) => {
  console.log('Parsing response: ' + response);
  const data = [];
  const imageResults = JSON.parse(response).value;

  data.push(imageResults[0].contentUrl);
  data.push(imageResults[1].contentUrl);
  data.push(imageResults[2].contentUrl);

  return data;
};

const buildEndpoint = async (searchTerm, color) => {
  return 'https://mosaicly.cognitiveservices.azure.com/bing/v7.0/images/search?&q=' +
    searchTerm + '&color=' + color
};
