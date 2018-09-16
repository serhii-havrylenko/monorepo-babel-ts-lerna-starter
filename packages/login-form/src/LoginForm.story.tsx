import { storiesOf } from '@storybook/react';
import * as React from 'react';
// import { action } from '@storybook/addon-actions';
import { LoginForm } from './LoginForm';

storiesOf('LoginForm', module).add('with text', () => <LoginForm />);
// .add("with some emoji", () => (
//   <Button onClick={action("clicked")}>
//     <span role="img" aria-label="so cool">
//       😀 😎 👍 💯
//     </span>
//   </Button>
// ));
