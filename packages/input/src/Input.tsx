import * as React from 'react';
import styled from 'styled-components';

const Label = styled.label`
  margin-right: 10px;
  font-weight: bold;
`;

const NativeInput = styled.input`
  width: 100%;
`;

export interface InputProps {
  className?: string;
  id: string;
  name?: string;
  label?: string;
  type?: string;
}

export const Input: React.SFC<InputProps> = ({
  className,
  label,
  id,
  ...rest
}) => (
  <div className={className}>
    {label && <Label htmlFor={id}>{label}:</Label>}
    <NativeInput id={id} {...rest} />
  </div>
);

Input.defaultProps = {
  type: 'text',
};

export const StyledInput = styled(Input)`
  display: flex;
  margin: 10px;
`;
