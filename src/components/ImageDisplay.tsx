import React from 'react';

import Col from 'react-bootstrap/Col';

import ImageObj from './ImageObj';

const ImageDisplay: React.FC<{ url1?: string; url2?: string; loading: boolean}> = ({ url1, url2, loading }) => {
  return (
    <>
      <Col>
        <ImageObj url={url1}/>
      </Col>
      <Col>
        <ImageObj url={url2} loading={loading}/>
      </Col>
    </>
  );
};

export default ImageDisplay;
