// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CommunicationUserIdentifier } from '@azure/communication-common';
import {
  CallAdapterLocator,
  CallAdapter,
  CallAdapterState,
  CallComposite,
  toFlatCommunicationIdentifier,
  useAzureCommunicationCallAdapter
} from '@azure/communication-react';
/* @conditional-compile-remove(rooms) */
import { Role } from '@azure/communication-react';
import { DefaultButton, Spinner, Stack } from '@fluentui/react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSwitchableFluentTheme } from '../theming/SwitchableFluentThemeProvider';
import { createAutoRefreshingCredential } from '../utils/credential';
import { navigateToHomePage, WEB_APP_TITLE } from '../utils/AppUtils';
import { useIsMobile } from '../utils/useIsMobile';
import { buttonStyle, buttonWithIconStyles } from '../styles/EndCall.styles';

const goHomePage = 'Go to homepage';

export interface CallScreenProps {
  token: string;
  userId: CommunicationUserIdentifier;
  callLocator: CallAdapterLocator;
  displayName: string;
  /* @conditional-compile-remove(PSTN-calls) */
  alternateCallerId?: string;
  /* @conditional-compile-remove(rooms) */
  role?: Role;
}

export const CallScreen = (props: CallScreenProps): JSX.Element => {
  const {
    token,
    userId,
    callLocator,
    displayName,
    // onCallEnded,
    /* @conditional-compile-remove(PSTN-calls) */ alternateCallerId,
    /* @conditional-compile-remove(rooms) */ role
  } = props;
  const callIdRef = useRef<string>();
  const { currentTheme, currentRtl } = useSwitchableFluentTheme();
  const isMobileSession = useIsMobile();
  const [isEndCallScreen, setIsEndCallScreen] = React.useState(false);

  React.useEffect(() => {
    setIsEndCallScreen(false);
  }, []);

  const afterCreate = useCallback(
    async (adapter: CallAdapter): Promise<CallAdapter> => {
      adapter.on('callEnded', () => {
        setIsEndCallScreen(true);
      });
      adapter.on('error', (e) => {
        // Error is already acted upon by the Call composite, but the surrounding application could
        // add top-level error handling logic here (e.g. reporting telemetry).
        console.log('Adapter error event:', e);
      });
      adapter.onStateChange((state: CallAdapterState) => {
        const pageTitle = convertPageStateToString(state);
        document.title = `${pageTitle} - ${WEB_APP_TITLE}`;

        if (state?.call?.id && callIdRef.current !== state?.call?.id) {
          callIdRef.current = state?.call?.id;
          console.log(`Call Id: ${callIdRef.current}`);
        }
      });
      return adapter;
    },
    [callIdRef]
  );

  const credential = useMemo(
    () => createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), token),
    [token, userId]
  );
  const adapter = useAzureCommunicationCallAdapter(
    {
      userId,
      displayName,
      credential,
      locator: callLocator,
      /* @conditional-compile-remove(PSTN-calls) */
      alternateCallerId
    },
    afterCreate
  );

  // Dispose of the adapter in the window's before unload event.
  // This ensures the service knows the user intentionally left the call if the user
  // closed the browser tab during an active call.
  useEffect(() => {
    const disposeAdapter = (): void => adapter?.dispose();
    window.addEventListener('beforeunload', disposeAdapter);
    return () => window.removeEventListener('beforeunload', disposeAdapter);
  }, [adapter]);

  if (!adapter) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }

  let callInvitationUrl: string | undefined = window.location.href;
  /* @conditional-compile-remove(rooms) */
  // If role is defined then the call is a Rooms call so we should not make call invitation link available
  if (role) {
    callInvitationUrl = undefined;
  }

  const onPermissionsTroubleshootingClick = (permissionState: {
    camera: PermissionState;
    microphone: PermissionState;
  }): void => {
    console.log(permissionState);
    alert('permission troubleshooting clicked');
  };

  const onNetworkingTroubleShootingClick = (): void => {
    alert('network troubleshooting clicked');
  };

  return (
    <Stack style={{ position: 'relative', width: '100%', height: '100%' }} grow>
      <Stack style={{ height: isEndCallScreen ? '90%' : '100%', width: '100%', position: 'relative' }} grow>
        <CallComposite
          adapter={adapter}
          fluentTheme={currentTheme.theme}
          rtl={currentRtl}
          callInvitationUrl={callInvitationUrl}
          formFactor={isMobileSession ? 'mobile' : 'desktop'}
          /* @conditional-compile-remove(rooms) */
          role={role}
          /* @conditional-compile-remove(call-readiness) */
          options={{ onPermissionsTroubleshootingClick, onNetworkingTroubleShootingClick }}
        />
      </Stack>
      {isEndCallScreen && (
        <Stack
          style={{ position: 'relative', width: '100%', height: '10%', background: 'rgb(16, 110, 190)' }}
          grow
          verticalAlign="center"
        >
          <DefaultButton
            style={{ margin: 'auto' }}
            className={buttonStyle}
            styles={buttonWithIconStyles}
            text={goHomePage}
            onClick={() => {
              navigateToHomePage();
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};

const convertPageStateToString = (state: CallAdapterState): string => {
  switch (state.page) {
    case 'accessDeniedTeamsMeeting':
      return 'error';
    case 'leftCall':
      return 'end call';
    case 'removedFromCall':
      return 'end call';
    default:
      return `${state.page}`;
  }
};
