import React from 'react';
import Dropzone from 'react-dropzone';

import { Col, Row } from 'react-bootstrap';

const FileUpload: React.FC<{ onDrop: (files: any[]) => void }> = ({ onDrop }) => {
  return (
    <Row>
      <Col xs={{ span: 6, offset: 3 }}>
        <Dropzone
          multiple={false}
          onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()} style={{ border: '2px dashed grey', margin: '25px' }}>
                <input {...getInputProps()} />
                <p className="text-center">Upload a file here!</p>
              </div>
            </section>
          )}
        </Dropzone>
      </Col>
    </Row>
  );
};

export default FileUpload;
