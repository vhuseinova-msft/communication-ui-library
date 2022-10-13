import { UnsupportedBrowser } from '@azure/communication-react';
import { PrimaryButton, Spinner, Stack, Text } from '@fluentui/react';
import React, { useEffect, useState } from 'react';

export const BrowserSupportExample = (): JSX.Element => {
  const [browserCheckingState, setBrowserCheckingState] = useState<
    'notStarted' | 'checking' | 'supported' | 'unsupported'
  >();

  useEffect(() => {
    // TODO check browser supportness...
    setBrowserCheckingState('checking');
  }, []);

  return (
    <Stack verticalFill verticalAlign="center">
      {browserCheckingState === 'notStarted' && (
        <PrimaryButton onClick={() => setBrowserCheckingState('checking')}>Check browser support</PrimaryButton>
      )}

      {browserCheckingState === 'checking' && <Spinner label="Checking browser support..." />}

      {browserCheckingState === 'unsupported' && (
        <UnsupportedBrowser
          onTroubleShootingClick={() =>
            alert('Redirect the user to documentation can update their browser to a supported browser')
          }
        />
      )}

      {browserCheckingState === 'supported' && (
        <Text>Browser is supported 🎉 Take the user to the next stage, checking their device permissions.</Text>
      )}
    </Stack>
  );
};
