import {
  CallClientProvider,
  createStatefulCallClient,
  StatefulCallClient,
  usePropsFor
} from '@azure/communication-react';
import { Spinner, Stack } from '@fluentui/react';
import React, { useRef } from 'react';
import { ConfigurationpageCameraDropdown } from '../../../../../react-composites/src/composites/CallComposite/components/ConfigurationpageCameraDropdown';
import { ConfigurationpageMicDropdown } from '../../../../../react-composites/src/composites/CallComposite/components/ConfigurationpageMicDropdown';

export const DevicePermissionsCheckExample = (): JSX.Element => {
  const statefulCallClient = useRef<StatefulCallClient>(
    createStatefulCallClient({
      userId: { communicationUserId: '<USER ID>' }
    })
  );

  return (
    <Stack verticalFill verticalAlign="center">
      <CallClientProvider callClient={statefulCallClient.current}>
        <DevicePermissionsUI />
      </CallClientProvider>
    </Stack>
  );
};

const DevicePermissionsUI = (): JSX.Element => {
  // const cameraDropdownProps = usePropsFor(ConfigurationpageCameraDropdown) as any;
  // const microphoneDropdownProps = usePropsFor(ConfigurationpageMicDropdown) as any;

  return (
    <Stack verticalFill verticalAlign="center">
      <Spinner label="Check camera and microphone permissions..." />
      {/* <ConfigurationpageCameraDropdown {...cameraDropdownProps} /> */}
      {/* <ConfigurationpageMicDropdown {...microphoneDropdownProps} /> */}
    </Stack>
  );
};
