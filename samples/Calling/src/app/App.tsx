// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GroupCallLocator, TeamsMeetingLinkLocator } from '@azure/communication-calling';
/* @conditional-compile-remove(rooms) */
import { RoomLocator } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import { CallParticipantsLocator, Role } from '@azure/communication-react';
import { setLogLevel } from '@azure/logger';
import { initializeIcons, Spinner } from '@fluentui/react';
import { CallAdapterLocator } from '@azure/communication-react';
import React, { useEffect, useState } from 'react';
import {
  buildTime,
  callingSDKVersion,
  communicationReactSDKVersion,
  createGroupId,
  fetchTokenResponse,
  getGroupIdFromUrl,
  getTeamsLinkFromUrl,
  isLandscape,
  isOnIphoneAndNotSafari,
  navigateToHomePage,
  WEB_APP_TITLE
} from './utils/AppUtils';
/* @conditional-compile-remove(rooms) */
import { createRoomId, getRoomIdFromUrl, joinRoom } from './utils/AppUtils';
import { useIsMobile } from './utils/useIsMobile';
import { useSecondaryInstanceCheck } from './utils/useSecondaryInstanceCheck';
import { CallError } from './views/CallError';
import { CallScreen } from './views/CallScreen';
import { EndCall } from './views/EndCall';
import { HomeScreen } from './views/HomeScreen';
import { PageOpenInAnotherTab } from './views/PageOpenInAnotherTab';
import { UnsupportedBrowserPage } from './views/UnsupportedBrowserPage';

setLogLevel('warning');

console.log(
  `ACS sample calling app. Last Updated ${buildTime} Using @azure/communication-calling:${callingSDKVersion} and @azure/communication-react:${communicationReactSDKVersion}`
);

initializeIcons();

type AppPages = 'home' | 'call' | 'endCall';

const App = (): JSX.Element => {
  const [page, setPage] = useState<AppPages>('home');

  // User credentials to join a call with - these are retrieved from the server
  const [token, setToken] = useState<string>();
  const [userId, setUserId] = useState<CommunicationUserIdentifier>();
  const [userCredentialFetchError, setUserCredentialFetchError] = useState<boolean>(false);

  // Call details to join a call - these are collected from the user on the home screen
  const [callLocator, setCallLocator] = useState<CallAdapterLocator>(createGroupId());
  const [displayName, setDisplayName] = useState<string>('');

  /* @conditional-compile-remove(PSTN-calls) */
  const [alternateCallerId, setAlternateCallerId] = useState<string | undefined>();
  /* @conditional-compile-remove(rooms) */
  const [role, setRole] = useState<Role>('Presenter');

  // Get Azure Communications Service token from the server
  useEffect(() => {
    (async () => {
      try {
        const { token, user } = await fetchTokenResponse();
        setToken(token);
        setUserId(user);
      } catch (e) {
        console.error(e);
        setUserCredentialFetchError(true);
      }
    })();
  }, []);

  const isMobileSession = useIsMobile();
  const isLandscapeSession = isLandscape();
  const isAppAlreadyRunningInAnotherTab = useSecondaryInstanceCheck();

  useEffect(() => {
    if (isMobileSession && isLandscapeSession) {
      console.log('ACS Calling sample: Mobile landscape view is experimental behavior');
    }
  }, [isMobileSession, isLandscapeSession]);

  if (isMobileSession && isAppAlreadyRunningInAnotherTab) {
    return <PageOpenInAnotherTab />;
  }

  const supportedBrowser = !isOnIphoneAndNotSafari();
  if (!supportedBrowser) {
    return <UnsupportedBrowserPage />;
  }

  switch (page) {
    case 'home': {
      document.title = `home - ${WEB_APP_TITLE}`;
      // Show a simplified join home screen if joining an existing call
      const joiningExistingCall: boolean =
        !!getGroupIdFromUrl() ||
        !!getTeamsLinkFromUrl() ||
        /* @conditional-compile-remove(rooms) */ !!getRoomIdFromUrl();
      return (
        <HomeScreen
          joiningExistingCall={joiningExistingCall}
          startCallHandler={async (callDetails) => {
            setDisplayName(callDetails.displayName);
            /* @conditional-compile-remove(PSTN-calls) */
            setAlternateCallerId(callDetails.alternateCallerId);

            // There is an API call involved with creating a room so lets only create one if we know we have to
            /* @conditional-compile-remove(rooms) */
            if (callDetails.option === 'StartRooms') {
              let roomId = '';
              try {
                roomId = await createRoomId();
              } catch (e) {
                console.log(e);
              }

              setCallLocator({ roomId: roomId });
            } else if ('roomId' in callLocator) {
              if (userId) {
                setRole(callDetails.role as Role);
                await joinRoom(userId.communicationUserId, callLocator.roomId, callDetails.role as Role);
              } else {
                throw 'Invalid userId!';
              }
            }

            const locator = makeLocator({
              teamsLink: callDetails.teamsLink,
              /* @conditional-compile-remove(rooms) */ roomLocator: callDetails.roomLocator,
              /* @conditional-compile-remove(PSTN-calls) */ outboundParticipants: callDetails.outboundParticipants
            });

            setCallLocator(locator);

            // Update window URL to have a joinable link
            if (
              !joiningExistingCall &&
              /* @conditional-compile-remove(PSTN-calls) */ !callDetails.outboundParticipants
            ) {
              window.history.pushState({}, document.title, window.location.origin + getJoinParams(locator));
            }

            setPage('call');
          }}
        />
      );
    }
    case 'endCall': {
      document.title = `end call - ${WEB_APP_TITLE}`;
      return <EndCall rejoinHandler={() => setPage('call')} homeHandler={navigateToHomePage} />;
    }
    case 'call': {
      if (userCredentialFetchError) {
        document.title = `error - ${WEB_APP_TITLE}`;
        return (
          <CallError
            title="Error getting user credentials from server"
            reason="Ensure the sample server is running."
            rejoinHandler={() => setPage('call')}
            homeHandler={navigateToHomePage}
          />
        );
      }

      if (!token || !userId || !displayName || !callLocator) {
        document.title = `credentials - ${WEB_APP_TITLE}`;
        return <Spinner label={'Getting user credentials from server'} ariaLive="assertive" labelPosition="top" />;
      }
      return (
        <CallScreen
          token={token}
          userId={userId}
          displayName={displayName}
          callLocator={callLocator}
          /* @conditional-compile-remove(PSTN-calls) */
          alternateCallerId={alternateCallerId}
          onCallEnded={() => setPage('endCall')}
          /* @conditional-compile-remove(rooms) */
          role={role}
        />
      );
    }
    default:
      document.title = `error - ${WEB_APP_TITLE}`;
      return <>Invalid page</>;
  }
};

function makeLocator(props: {
  teamsLink?: TeamsMeetingLinkLocator;
  /* @conditional-compile-remove(rooms) */
  roomLocator?: RoomLocator;
  /* @conditional-compile-remove(PSTN-calls) */
  outboundParticipants?: string[];
}): CallAdapterLocator {
  /* @conditional-compile-remove(PSTN-calls) */
  if (props.outboundParticipants) {
    // set call participants and do not update the window URL since there is not a joinable link
    return { participantIDs: props.outboundParticipants };
  }
  /* @conditional-compile-remove(rooms) */
  if (props.roomLocator) {
    return props.roomLocator;
  }
  /* @conditional-compile-remove(rooms) */
  const roomId = getRoomIdFromUrl();
  /* @conditional-compile-remove(rooms) */
  if (roomId) {
    return roomId;
  }
  return props.teamsLink || getTeamsLinkFromUrl() || getGroupIdFromUrl() || createGroupId();
}

const getJoinParams = (
  locator:
    | TeamsMeetingLinkLocator
    | GroupCallLocator
    | /* @conditional-compile-remove(PSTN-calls) */ CallParticipantsLocator
    | /* @conditional-compile-remove(rooms) */ RoomLocator
): string => {
  if ('meetingLink' in locator) {
    return '?teamsLink=' + encodeURIComponent(locator.meetingLink);
  }
  /* @conditional-compile-remove(PSTN-calls) */
  if ('participantIDs' in locator) {
    return '';
  }
  /* @conditional-compile-remove(rooms) */
  if ('roomId' in locator) {
    return '?roomId=' + encodeURIComponent(locator.roomId);
  }
  return '?groupId=' + encodeURIComponent(locator.groupId);
};

export default App;
