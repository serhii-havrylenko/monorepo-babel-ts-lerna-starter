import { mount } from 'enzyme';
import * as React from 'react';

import { Input } from './Input';

describe('Input', () => {
  test('should match snapshot and styles for default props', () => {
    expect(mount(<Input />)).toMatchSnapshot();
  });

  test('should match snapshot with label', () => {
    expect(mount(<Input id="test" label="Name" />)).toMatchSnapshot();
  });
});
