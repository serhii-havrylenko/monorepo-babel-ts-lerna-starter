import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import { StyledInput as Input } from './Input';

storiesOf('Input', module)
  .add('default', () => <Input id="test" />)
  .add('with label', () => (
    <Input id="test" label={text('Label', 'Username')} />
  ))
  .add('with label and type', () => (
    <Input
      id="test"
      label={text('Label', 'Username')}
      type={text('Type', 'text')}
    />
  ));
