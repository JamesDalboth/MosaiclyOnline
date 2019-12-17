import React from 'react';

import { Col, Container, Row } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <hr/>
        </Col>
      </Row>
      <Row>
        <Col>
          <a text-align="center" href={'https://github.com/JamesDalboth/MosaiclyOnline'}>
            <h4 className="text-center">
              Source Code
            </h4>
          </a>
        </Col>
      </Row>
      <Row>
        <Col>
          <p className="text-center">
            Built by James Dalboth
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <a text-align="center" href={'https://github.com/JamesDalboth/Mosaicly'}>
            <h4 className="text-center">
              Original Source Code
            </h4>
          </a>
        </Col>
      </Row>
      <Row>
        <Col>
          <p className="text-center">
            Original built by James Dalboth, Matthew Ho, Rohit Prasad and Harry Black
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Footer;
