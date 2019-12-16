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
  'grey',
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
  console.log('Querying ' + endpoint);
  return request(endpoint);
};

const parseResponse = (response) => {
  console.log('Parsing response: ' + response);
  const data = [];
  const imageResults = JSON.parse(response).images_results;

  data.push(imageResults[0].original);
  data.push(imageResults[1].original);
  data.push(imageResults[2].original);

  return data;
};

const buildEndpoint = async (searchTerm, color) => {
  return 'https://serpapi.com/search?q=' +
    searchTerm +
    '&tbm=isch&ijn=0&tbs=isz:m,ic:specific,isc:' +
    color +
    ',iar:s,ift:png';
};
