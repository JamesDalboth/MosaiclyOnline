import React from 'react';

import { Button, Form } from 'react-bootstrap';

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

interface InputFormProps {
  onChange: (event: InputChangeEvent) => void;
  onSubmit: VoidFunction;
}

const InputForm: React.FC<InputFormProps> = ({ onChange, onSubmit }) => {
  return (
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
  );
};

export default InputForm;
