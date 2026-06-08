import '../src/app.css';

import type { Preview } from '@storybook/react';

// @see https://github.com/storybookjs/storybook/issues/22452
// @ts-expect-error BigInt serialization for Storybook controls
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
