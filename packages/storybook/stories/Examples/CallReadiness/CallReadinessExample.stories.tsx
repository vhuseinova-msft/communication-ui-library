// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Title, Heading, Description, Canvas } from '@storybook/addon-docs';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';

import { EXAMPLES_FOLDER_PREFIX } from '../../constants';
import { BrowserSupportExample } from './snippets/CallReadinessExample.BrowserSupported.snippet';
import { DevicePermissionsCheckExample } from './snippets/CallReadinessExample.DevicePermissionsCheck.snippet';

const BrowserSupportExampleText =
  require('!!raw-loader!./snippets/CallReadinessExample.BrowserSupported.snippet.tsx').default;
const DevicePermissionsCheckExampleText =
  require('!!raw-loader!./snippets/CallReadinessExample.DevicePermissionsCheck.snippet.tsx').default;

const getDocs: () => JSX.Element = () => {
  return (
    <>
      <Title>Call Readiness</Title>

      <Heading>Creating a call readiness experience</Heading>
      <Description>
        This example shows how to create an experience where we ensure an end user in their best state before joining a
        call. By _best state_ we refer to being on a supported browser and have camera and microphone permissions
        granted.
      </Description>
      <Heading>Step 1 - Validating browser support</Heading>
      <Description>
        First, we check if the browser is supported. If it is not, we use the `UnsupportedBrowser` component to display
        a message to the user.
      </Description>
      <Canvas mdxSource={BrowserSupportExampleText}>
        <div style={{ height: '17.188rem' }}>
          <BrowserSupportExample />
        </div>
      </Canvas>
      <Heading>Step 2 - Validating camera and microphone permissions</Heading>
      <Description>
        Next, we get the user's device permissions set up. To request permissions we use the `DeviceSelectionDropdown`
        to trigger the `PermissionsPopup` component.
      </Description>
      <Canvas mdxSource={DevicePermissionsCheckExampleText}>
        <div style={{ height: '17.188rem' }}>
          <DevicePermissionsCheckExample />
        </div>
      </Canvas>
    </>
  );
};

const CallReadinessStory = (args): JSX.Element => {
  return <>Preview unavailable. See Docs tab</>;
};

export const CallReadiness = CallReadinessStory.bind({});

export default {
  id: `${EXAMPLES_FOLDER_PREFIX}-callreadiness`,
  title: `${EXAMPLES_FOLDER_PREFIX}/Call Readiness`,
  component: CallReadiness,
  argTypes: {},
  parameters: {
    docs: {
      page: () => getDocs()
    }
  }
} as Meta;
