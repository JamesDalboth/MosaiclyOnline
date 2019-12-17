import React from 'react';

import { Image } from 'react-bootstrap';

const ImageObj: React.FC<{ url?: string, loading?: boolean }> = ({ url, loading }) => {
  const loadingGif = 'https://media2.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif';

  if (loading) {
    return (
      <Image src={loadingGif} fluid={true}/>
    );
  }

  return (
    <Image src={url} fluid={true}/>
  );
};

export default ImageObj;
