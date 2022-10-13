import { UnsupportedBrowser } from '@azure/communication-react';
import { Spinner, Stack } from '@fluentui/react';
import React, { useEffect, useState } from 'react';

export const DevicePermissionsCheckExample = (): JSX.Element => {
  const [, setIsBrowserSupported] = useState<boolean>();

  useEffect(() => {
    // TODO check browser supportness...
    setIsBrowserSupported(true);
  }, []);

  return (
    <Stack verticalFill verticalAlign="center">
      <Spinner label="Todo: story..." />
    </Stack>
  );
};
