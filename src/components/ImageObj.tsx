import React from 'react';

import { Image } from 'react-bootstrap';

const ImageObj: React.FC<{ url?: string; loading?: boolean }> = ({ url, loading }) => {
  const loadingGif = 'https://media2.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif';
  const defaultImg = 'https://www.mycontact.london/wp-content/uploads/2019/01/grey-square.png';

  if (loading) {
    return (
      <Image src={loadingGif} fluid={true}/>
    );
  }

  if (url === undefined) {
    return (
      <Image src={defaultImg} fluid={true} thumbnail/>
    );
  }

  return (
    <Image src={url} fluid={true} thumbnail/>
  );
};

export default ImageObj;
