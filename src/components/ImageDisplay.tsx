import React from 'react';

import { Col, Row } from 'react-bootstrap';

import ImageObj from './ImageObj';

interface ImageDisplayProps {
  src1?: string;
  src2?: string;
  loading: boolean;
  missingImage: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ src1, src2, loading, missingImage }) => {
  const getImageObj = (): JSX.Element => {
    if (missingImage) {
      return (
        <>
          <ImageObj url={src1} missing={true}/>
          <h5 className="text-center" style={{ color: 'red' }}>
            Please upload an image!
          </h5>
        </>
      );
    }

    return (
      <ImageObj url={src1} missing={false}/>
    );
  };

  return (
    <Row>
      <Col xs={{ span: 3, offset: 2 }}>
        <h3 className="text-center"> Original </h3>
        {getImageObj()}
      </Col>
      <Col xs={{ span: 3, offset: 2 }}>
        <h3 className="text-center"> Mosaiced </h3>
        <ImageObj url={src2} loading={loading} missing={false}/>
        {src2 !== undefined && <a href={src2} download>
          <h4 className="text-center"> Download </h4>
        </a>}
      </Col>
    </Row>
  );
};

export default ImageDisplay;
