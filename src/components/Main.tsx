import React from 'react';

import { Col, Container, Row } from 'react-bootstrap';

import ImageDisplay from './ImageDisplay';
import InputForm from './InputForm';
import FileUpload from './FileUpload';
import Footer from './Footer';

// eslint-disable-next-line
const request = require('request-promise');

interface FormFields {
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
      searchTerm: '',
      tileSize: '',
    },
  );
  const [imageData, setImageData] = React.useState<string>();
  const [result, setResult] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = (): void => {
    setLoading(true);

    request({
      method: 'POST',
      url: 'https://hmdvu2o3zh.execute-api.us-east-1.amazonaws.com/prod',
      body: {
        'searchTerm': fields.searchTerm,
        'data': imageData,
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

  const toBase64 = (file: any): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const onDrop = (files: any[]): void => {
    const file = files[0];
    toBase64(file)
      .then((base64: string) => setImageData(base64))
      .catch(console.log);
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
        <ImageDisplay url1={imageData} url2={result} loading={loading}/>
      </Row>
      <FileUpload onDrop={onDrop}/>
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
