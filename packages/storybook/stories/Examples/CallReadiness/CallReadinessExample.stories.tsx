// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Title, Heading, Description, Canvas, Source } from '@storybook/addon-docs';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';

import { EXAMPLES_FOLDER_PREFIX } from '../../constants';
import { BrowserSupportExample } from './snippets/CallReadinessExample.BrowserSupported.snippet';
import { DevicePermissionsCheckExample } from './snippets/CallReadinessExample.DevicePermissionsCheck.snippet';

const BrowserSupportExampleText =
  require('!!raw-loader!./snippets/CallReadinessExample.BrowserSupported.snippet.tsx').default;
const DevicePermissionsCheckExampleText =
  require('!!raw-loader!./snippets/CallReadinessExample.DevicePermissionsCheck.snippet.tsx').default;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const fakeCallClientForBrowserCheck = {
  getEnvironmentInfo: async () => {
    await sleep(2000);
    return { isSupportedEnvironment: false };
  }
};

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
          <BrowserSupportExample callClient={fakeCallClientForBrowserCheck as any} />
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
      <Heading>Call readiness in the Call Composite</Heading>
      <Description>
        If you are making use of the CallComposite or CallWithChatComposite, you can get this behavior by enabling the
        following properties:
      </Description>
      <Source
        language="tsx"
        code={`<CallComposite
  options={{
    features: {
      browserCheck: true,
      devicePermissionHelpers: true
    }
  }}
/>`}
      />
      <Heading>Alternative Experience - Call Setup Checks Experience</Heading>
      <Description>Or we could create a pre-call experience that does all this...</Description>
      <Source
        language="tsx"
        code={`<CallSetupChecks
  onSuccess={() => void}
  onBrowserUnsupportedFurtherTroubleshooting={(environment) => void}
  onPermissionsFurtherTroubleshooting={(deviceStatus) => void}
/>`}
      />
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
