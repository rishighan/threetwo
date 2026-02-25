// Button.stories.ts|tsx

import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Card } from '../components/shared/Carda';
import "../assets/scss/App.css";
export default {
  /* 👇 The title prop is optional.
  * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
  * to learn how to generate automatic titles
  */
  title: 'Card',
  component: Card,
} as ComponentMeta<typeof Card>;

//👇 We create a “template” of how args map to rendering
const Template = (args) => <Card {...args} />;
//👇 Each story then reuses that template
export const Vertical = Template.bind({});
Vertical.args = {
  orientation: 'vertical',
  hasDetails: true,
  children: <div>details</div>,
  imageUrl: "/wotr.jpg",
}
