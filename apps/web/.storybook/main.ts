import type { StorybookConfig } from '@storybook/react-vite';

// @see https://github.com/storybookjs/storybook/issues/22452
// @ts-expect-error BigInt serialization for Storybook controls
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
