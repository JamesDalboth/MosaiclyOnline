import React from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import ImageDisplay from './ImageDisplay';
import InputForm from './InputForm';
import Footer from './Footer';

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
  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = (): void => {
    setLoading(true);
    setImageUrl(fields.imageUrl);

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
        setLoading(false);
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
      <Row>
        <Col>
          <h1 className="text-center">Mosaicly Online</h1>
          <hr/>
        </Col>
      </Row>
      <Row>
        <ImageDisplay url1={imageUrl} url2={result} loading={loading}/>
      </Row>
      <Row>
        <Col xs={{ span: 8, offset: 2 }}>
          <InputForm onChange={onChange} onSubmit={onSubmit}/>
        </Col>
      </Row>
      <Row>
        <Footer/>
      </Row>
    </Container>
  );
};

export default Main;
