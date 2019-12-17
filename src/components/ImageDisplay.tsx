import React from 'react';

import { Col, Row } from 'react-bootstrap';

import ImageObj from './ImageObj';

const ImageDisplay: React.FC<{ url1?: string; url2?: string; loading: boolean}> = ({ url1, url2, loading }) => {
  return (
    <Row>
      <Col xs={{ span: 3, offset: 2 }}>
        <h3 className="text-center"> Original </h3>
        <ImageObj url={url1}/>
      </Col>
      <Col xs={{ span: 3, offset: 2 }}>
        <h3 className="text-center"> Mosaic'd </h3>
        <ImageObj url={url2} loading={loading}/>
        {url2 !== undefined && <a href={url2} download>
          <h4 className="text-center"> Download </h4>
          </a>}
      </Col>
    </Row>
  );
};

export default ImageDisplay;
