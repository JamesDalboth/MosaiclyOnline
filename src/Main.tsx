import React from 'react';

import { Button, Col, Container, Form, Image, Row } from 'react-bootstrap';

// eslint-disable-next-line
const request = require('request-promise');

interface FormFields {
  imageUrl: string;
  searchTerm: string;
  tileSize: string;
};

type InputChangeEvent = React.FormEvent<any> &
  {
    target: {
      id: keyof FormFields;
      value: FormFields[keyof FormFields];
    };
  }

const Main: React.FC = () => {
  const [fields, setFields] = React.useState<FormFields>(
    {
      imageUrl: '',
      searchTerm: '',
      tileSize: '',
    },
  );

  const [imageUrl, setImageUrl] = React.useState<string>();
  const [result, setResult] = React.useState<string>();

  const onSubmit = (): void => {
    request({
      method: 'POST',
      url: 'https://hmdvu2o3zh.execute-api.us-east-1.amazonaws.com/prod',
      body: {
        'searchTerm': fields.searchTerm,
        'imageUrl': fields.imageUrl,
        'tileSize': Number(fields.tileSize),
      },
      headers: {
        'Origin': 'http://dalboth.com/MosaiclyOnline/',
      },
      json: true,
    })
      .then((url: string) => {
        console.log(url);
        setResult(url);
        setImageUrl(fields.imageUrl);
      })
      .catch(console.error);
  };

  const onChange = (event: InputChangeEvent): void => {
    const key = event.target.id;
    const val = event.target.value;

    const stateUpdate = { fields: fields as Pick<FormFields, keyof FormFields> };
    stateUpdate.fields[key] = val;
    setFields(stateUpdate.fields);
  };

  return (
    <Container>
      <Col xs={{ span: 8, offset: 2 }}>
        <Row>
          <Col>
            <h1>Mosaicly Online</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Image src={imageUrl} fluid={true}/>
          </Col>
          <Col>
            <Image src={result} fluid={true}/>
          </Col>
        </Row>
        <Row>
          <Form>
            <Form.Group controlId="imageUrl">
              <Form.Label>Image Url</Form.Label>
              <Form.Control
                placeholder="Enter image url"
                type="text"
                onChange={onChange}
                required/>
            </Form.Group>

            <Form.Group controlId="searchTerm">
              <Form.Label>Search Term</Form.Label>
              <Form.Control
                placeholder="Search Term"
                type="text"
                onChange={onChange}
                required/>
            </Form.Group>

            <Form.Group controlId="tileSize">
              <Form.Label>Tile Size (px)</Form.Label>
              <Form.Control
                placeholder="5"
                type="text"
                onChange={onChange}
                required/>
            </Form.Group>

            <Button variant="primary" onClick={onSubmit}>
              Submit
            </Button>
          </Form>
        </Row>
        <Row>
          Original built by James Dalboth, Matthew Ho, Rohit Prasad and Harry Black
        </Row>
      </Col>
    </Container>
  );
};

export default Main;
