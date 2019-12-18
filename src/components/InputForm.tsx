import React from 'react';

import { Button, Form } from 'react-bootstrap';

interface FormFields {
  searchTerm: string;
  tileSize: string;
  colourAdjustment: string;
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
  onSubmit: (event: React.FormEvent<any>) => void;
  onCheck: (key: string, val: boolean) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onChange, onSubmit, onCheck }) => {
  return (
    <>
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="searchTerm">
          <Form.Label>Search Term</Form.Label>
          <Form.Control
            placeholder="Search Term"
            type="text"
            onChange={onChange}
            required/>
          <Form.Control.Feedback type="valid">
            Looks Good!.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="tileSize">
          <Form.Label>Tile Size (px)</Form.Label>
          <Form.Control
            placeholder="5"
            type="text"
            onChange={onChange}
            required/>
          <Form.Control.Feedback type="valid">
            Looks Good!.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="colourAdjustment">
          <Form.Check
            type="checkbox"
            label="Colour Adjustment Mode"
            onChange={(event: any) => onCheck('colourAdjustment', event.target.checked)}/>
        </Form.Group>

        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Form>
    </>
  );
};

export default InputForm;
