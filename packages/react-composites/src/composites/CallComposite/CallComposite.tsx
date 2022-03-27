// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { _isInCall } from '@internal/calling-component-bindings';
import {
  OnRenderAvatarCallback,
  ParticipantMenuItemsCallback,
  useTheme,
  _DrawerSurface
} from '@internal/react-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { BaseProvider, BaseCompositeProps } from '../common/BaseComposite';
import { CallCompositeIcons } from '../common/icons';
import { useLocale } from '../localization';
import { CallAdapter, CallAdapterState } from './adapter/CallAdapter';
import { CallAdapterProvider, useAdapter } from './adapter/CallAdapterProvider';
import { CallPage } from './pages/CallPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { NoticePage } from './pages/NoticePage';
import { useSelector } from './hooks/useSelector';
import { getPage } from './selectors/baseSelectors';
import { LobbyPage } from './pages/LobbyPage';
import {
  drawerContainerStyles,
  mainScreenContainerStyleDesktop,
  mainScreenContainerStyleMobile
} from './styles/CallComposite.styles';
import { CallControlOptions } from './types/CallControlOptions';
import { PrimaryButton, Stack } from '@fluentui/react';
import { Video48Filled, MicOn48Filled, Settings28Filled } from '@fluentui/react-icons';
import { Icon } from '@iconify/react';
import { devicePermissionSelector } from './selectors/devicePermissionSelector';

/**
 * Props for {@link CallComposite}.
 *
 * @public
 */
export interface CallCompositeProps extends BaseCompositeProps<CallCompositeIcons> {
  /**
   * An adapter provides logic and data to the composite.
   * Composite can also be controlled using the adapter.
   */
  adapter: CallAdapter;
  /**
   * Optimizes the composite form factor for either desktop or mobile.
   * @remarks `mobile` is currently only optimized for Portrait mode on mobile devices and does not support landscape.
   * @defaultValue 'desktop'
   */
  formFactor?: 'desktop' | 'mobile';
  /**
   * URL to invite new participants to the current call. If this is supplied, a button appears in the Participants
   * Button flyout menu.
   */
  callInvitationUrl?: string;
  /**
   * Flags to enable/disable or customize UI elements of the {@link CallComposite}.
   */
  options?: CallCompositeOptions;
}

/**
 * Optional features of the {@link CallComposite}.
 *
 * @public
 */
export type CallCompositeOptions = {
  /**
   * Surface Azure Communication Services backend errors in the UI with {@link @azure/communication-react#ErrorBar}.
   * Hide or show the error bar.
   * @defaultValue true
   */
  errorBar?: boolean;
  /**
   * Hide or Customize the control bar element.
   * Can be customized by providing an object of type {@link @azure/communication-react#CallControlOptions}.
   * @defaultValue true
   */
  callControls?: boolean | CallControlOptions;
};

type MainScreenProps = {
  mobileView: boolean;
  videoPermissionsDeniedOnClick(): void;
  onRenderAvatar?: OnRenderAvatarCallback;
  callInvitationUrl?: string;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
  onFetchParticipantMenuItems?: ParticipantMenuItemsCallback;
  options?: CallCompositeOptions;
};

const MainScreen = (props: MainScreenProps): JSX.Element => {
  const { callInvitationUrl, onRenderAvatar, onFetchAvatarPersonaData, onFetchParticipantMenuItems } = props;
  const page = useSelector(getPage);

  const adapter = useAdapter();
  const locale = useLocale();

  switch (page) {
    case 'configuration':
      return (
        <ConfigurationPage
          mobileView={props.mobileView}
          startCallHandler={(): void => {
            adapter.joinCall();
          }}
          videoPermissionsDeniedOnClick={props.videoPermissionsDeniedOnClick}
        />
      );
    case 'accessDeniedTeamsMeeting':
      return (
        <NoticePage
          iconName="NoticePageAccessDeniedTeamsMeeting"
          title={locale.strings.call.failedToJoinTeamsMeetingReasonAccessDeniedTitle}
          moreDetails={locale.strings.call.failedToJoinTeamsMeetingReasonAccessDeniedMoreDetails}
          dataUiId={'access-denied-teams-meeting-page'}
        />
      );
    case 'removedFromCall':
      return (
        <NoticePage
          iconName="NoticePageRemovedFromCall"
          title={locale.strings.call.removedFromCallTitle}
          moreDetails={locale.strings.call.removedFromCallMoreDetails}
          dataUiId={'removed-from-call-page'}
        />
      );
    case 'joinCallFailedDueToNoNetwork':
      return (
        <NoticePage
          iconName="NoticePageJoinCallFailedDueToNoNetwork"
          title={locale.strings.call.failedToJoinCallDueToNoNetworkTitle}
          moreDetails={locale.strings.call.failedToJoinCallDueToNoNetworkMoreDetails}
          dataUiId={'join-call-failed-due-to-no-network-page'}
        />
      );
    case 'leftCall':
      return (
        <NoticePage
          iconName="NoticePageLeftCall"
          title={locale.strings.call.leftCallTitle}
          moreDetails={locale.strings.call.leftCallMoreDetails}
          dataUiId={'left-call-page'}
        />
      );
    case 'lobby':
      return <LobbyPage mobileView={props.mobileView} options={props.options} />;
    case 'call':
      return (
        <CallPage
          onRenderAvatar={onRenderAvatar}
          callInvitationURL={callInvitationUrl}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          onFetchParticipantMenuItems={onFetchParticipantMenuItems}
          mobileView={props.mobileView}
          options={props.options}
        />
      );
    default:
      throw new Error('Invalid call composite page');
  }
};

/**
 * A customizable UI composite for calling experience.
 *
 * @remarks Call composite min width/height are as follow:
 * - mobile: 19.5rem x 21rem (312px x 336px, with default rem at 16px)
 * - desktop: 30rem x 22rem (480px x 352px, with default rem at 16px)
 *
 * @public
 */
export const CallComposite = (props: CallCompositeProps): JSX.Element => {
  const { adapter, formFactor = 'desktop' } = props;

  const mobileView = formFactor === 'mobile';

  const mainScreenContainerClassName = useMemo(() => {
    return mobileView ? mainScreenContainerStyleMobile : mainScreenContainerStyleDesktop;
  }, [mobileView]);

  return (
    <div className={mainScreenContainerClassName}>
      <BaseProvider {...props}>
        <CallAdapterProvider adapter={adapter}>
          <MainScreenPreparation {...props} />
        </CallAdapterProvider>
      </BaseProvider>
    </div>
  );
};

const MainScreenPreparation = (props: CallCompositeProps): JSX.Element => {
  const {
    adapter,
    callInvitationUrl,
    onFetchAvatarPersonaData,
    onFetchParticipantMenuItems,
    options,
    formFactor = 'desktop'
  } = props;

  const [microphonePermissionState, setMicrophonePermissionsState] = useState<
    'permissionNeeded' | 'permissionDenied' | 'permissionDeniedBySystem' | 'noPermissionNeeded'
  >('noPermissionNeeded');

  const [microphonePrompted, setMicrophonePrompted] = useState(false);

  const [cameraPermissionState, setCameraPermissionState] = useState<
    'permissionNeeded' | 'permissionDenied' | 'permissionDeniedBySystem' | 'noPermissionNeeded'
  >('noPermissionNeeded');

  const [cameraPrompted, setCameraPrompted] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        // devices.forEach(function (device) {
        //   alert(device.kind + ': ' + device.label + ' id = ' + device.deviceId);
        // });
        let noAudioDevices = true;
        devices.forEach((device) => {
          if (device.kind.includes('audio') && device.deviceId !== '') {
            noAudioDevices = false;
          }
        });
        if (noAudioDevices) {
          setMicrophonePermissionsState('permissionNeeded');
        } else {
          if (adapter.getState().devices?.deviceAccess?.audio) {
            setMicrophonePermissionsState('noPermissionNeeded');
          } else {
            if (microphonePrompted) {
              setMicrophonePermissionsState('permissionDeniedBySystem');
            } else {
              setMicrophonePermissionsState('permissionNeeded');
            }
          }
        }
      })
      .catch(function (err) {
        alert('enumerateDevices err');
      });
    const update = (newState: CallAdapterState): void => {
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          // devices.forEach(function (device) {
          //   alert(device.kind + ': ' + device.label + ' id = ' + device.deviceId);
          // });
          let noAudioDevices = true;
          devices.forEach((device) => {
            if (device.kind.includes('audio') && device.deviceId !== '') {
              noAudioDevices = false;
            }
          });
          let noVideoDevices = true;
          devices.forEach((device) => {
            if (device.kind.includes('video') && device.deviceId !== '') {
              noVideoDevices = false;
            }
          });
          if (noAudioDevices) {
            if (microphonePrompted) {
              setMicrophonePermissionsState('permissionDeniedBySystem');
            } else {
              setMicrophonePermissionsState('permissionNeeded');
            }
          } else {
            if (newState.devices?.deviceAccess?.audio) {
              setMicrophonePermissionsState('noPermissionNeeded');
            } else {
              if (microphonePrompted) {
                setMicrophonePermissionsState('permissionDeniedBySystem');
              } else {
                setMicrophonePermissionsState('permissionNeeded');
              }
            }
          }
          if (cameraPermissionState === 'permissionNeeded') {
            if (noVideoDevices) {
              setCameraPermissionState('permissionNeeded');
            } else {
              if (newState.devices?.deviceAccess?.video) {
                setCameraPermissionState('noPermissionNeeded');
              } else if (cameraPrompted) {
                setCameraPermissionState('permissionDeniedBySystem');
              }
            }
          }
        })
        .catch(function (err) {
          alert('enumerateDevices err onUpdate');
        });
    };
    adapter.onStateChange(update);
    return () => {
      adapter.offStateChange(update);
    };
  }, [adapter]);
  const mobileView = formFactor === 'mobile';

  const microphonePromptOnClick = useCallback(() => {
    setMicrophonePrompted(true);
    adapter.askDevicePermission({ audio: true, video: false });
    adapter.queryMicrophones();
    adapter.querySpeakers();
    // navigator.mediaDevices
    //   .getUserMedia({ audio: true })
    //   .then(() => {
    //     if (adapter.getState().devices?.deviceAccess?.audio) {
    //       alert('3.1');
    //       setMicrophonePermissionsState('noPermissionNeeded');
    //     }
    //   })
    //   .catch((e) => {
    //     alert('4');
    //     setMicrophonePermissionsState('permissionDeniedBySystem');
    //   });
  }, [adapter.getState().devices?.deviceAccess?.audio]);

  let drawer: JSX.Element | null = null;
  if (microphonePermissionState === 'permissionNeeded') {
    drawer = <MicrophonePermissionPrompt adapter={adapter} onClick={microphonePromptOnClick} />;
  } else if (microphonePermissionState === 'permissionDenied') {
    drawer = <MicrophonePermissionBlocker />;
  } else if (microphonePermissionState === 'permissionDeniedBySystem') {
    drawer = <MicrophonePermissionSystemBlocker />;
  } else if (cameraPermissionState === 'permissionNeeded') {
    drawer = (
      <VideoPermissionPrompt
        adapter={adapter}
        onLightDismiss={() => setCameraPermissionState('noPermissionNeeded')}
        onClick={() => {
          setCameraPrompted(true);
          props.adapter.askDevicePermission({ video: true, audio: false });
          props.adapter.queryCameras();
        }}
      />
    );
  } else if (cameraPermissionState === 'permissionDeniedBySystem') {
    drawer = (
      <VideoPermissionBlocker
        onLightDismiss={() => {
          setCameraPermissionState('noPermissionNeeded');
        }}
      />
    );
  }

  return (
    <Stack styles={{ root: { width: '100%', height: '100%' } }}>
      <MainScreen
        callInvitationUrl={callInvitationUrl}
        onFetchAvatarPersonaData={onFetchAvatarPersonaData}
        onFetchParticipantMenuItems={onFetchParticipantMenuItems}
        mobileView={mobileView}
        options={options}
        videoPermissionsDeniedOnClick={() => setCameraPermissionState('permissionNeeded')}
      />
      {drawer}
    </Stack>
  );
};

const MicrophonePermissionPrompt = (props: {
  adapter: CallAdapter;
  onClick: () => void;
  onLightDismiss?: () => void;
}): JSX.Element | null => {
  const theme = useTheme();

  const allowButtonStyles = {
    root: {
      minHeight: '3rem',
      borderRadius: theme.effects.roundedCorner6,
      height: '2.5rem',
      width: '100%'
    }
  };

  return (
    <Sheet {...props}>
      <Stack
        horizontalAlign="center"
        styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}
        tokens={{ childrenGap: '1.5rem' }}
      >
        <Stack horizontalAlign="center" styles={{ root: { width: '100%' } }}>
          <CircleBackground backgroundColor={theme.palette.themePrimary}>
            <MicOn48Filled style={{ color: theme.palette.themePrimary }} />
          </CircleBackground>
        </Stack>
        <Stack horizontalAlign="center" tokens={{ childrenGap: '0.5rem' }}>
          <Stack styles={{ root: { fontSize: theme.fonts.xxLarge.fontSize, fontWeight: '600' } }}>
            {'Allow access to microphone'}
          </Stack>
          <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
            {'Enable permissions to access your microphone, so participants can hear you.'}
          </Stack>
        </Stack>
        <Stack styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}>
          <PrimaryButton onClick={props.onClick} styles={allowButtonStyles}>
            {'Allow access'}
          </PrimaryButton>
        </Stack>
        <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
          {'You will see a popup asking for permissions. Tap "Allow".'}
        </Stack>
      </Stack>
    </Sheet>
  );
};

const MicrophonePermissionBlocker = (props: { onLightDismiss?: () => void }): JSX.Element | null => {
  const theme = useTheme();

  const buttonStyles = {
    root: {
      minHeight: '3rem',
      borderRadius: theme.effects.roundedCorner6,
      height: '2.5rem',
      width: '100%'
    }
  };

  return (
    <Sheet {...props}>
      <Stack
        horizontalAlign="center"
        styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}
        tokens={{ childrenGap: '0.5rem' }}
      >
        <Stack horizontalAlign="center" styles={{ root: { width: '100%' } }}>
          <CircleBackground backgroundColor={theme.palette.themePrimary}>
            <MicOn48Filled style={{ color: theme.palette.themePrimary }} />
          </CircleBackground>
        </Stack>
        <Stack verticalAlign="center" tokens={{ childrenGap: '0.5rem' }}>
          <Stack styles={{ root: { fontSize: theme.fonts.xxLarge.fontSize, fontWeight: '600' } }}>
            {'Refresh and allow microphone access'}
          </Stack>
          <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
            {'Enable permissions to access your camera, so participants can hear you.'}
          </Stack>
        </Stack>
        <Stack styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}>
          <PrimaryButton
            onClick={() => {
              window.location.reload();
            }}
            styles={buttonStyles}
          >
            {'Refresh page'}
          </PrimaryButton>
        </Stack>
      </Stack>
    </Sheet>
  );
};

const MicrophonePermissionSystemBlocker = (props: { onLightDismiss?: () => void }): JSX.Element | null => {
  const theme = useTheme();

  return (
    <Sheet {...props}>
      <Stack
        horizontalAlign="center"
        styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}
        tokens={{ childrenGap: '0.5rem' }}
      >
        <Stack horizontalAlign="center" styles={{ root: { width: '100%' } }}>
          <CircleBackground backgroundColor={theme.palette.themePrimary}>
            <Settings28Filled style={{ color: theme.palette.themePrimary }} />
          </CircleBackground>
        </Stack>
        <Stack verticalAlign="center" tokens={{ childrenGap: '0.5rem' }}>
          <Stack styles={{ root: { fontSize: theme.fonts.xxLarge.fontSize, fontWeight: '600' } }}>
            {'Allow microphone access to continue'}
          </Stack>
          <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
            {'So other participants can hear you.'}
          </Stack>
        </Stack>
        <Stack tokens={{ childrenGap: '0.25rem' }}>
          <Stack>{'1. Go to the Settings app'}</Stack>
          <Stack>{'2. Scroll down to settings for this browser'}</Stack>
          <Stack>{'3. Turn on Microphone (Camera optional)'}</Stack>
        </Stack>
      </Stack>
    </Sheet>
  );
};

const VideoPermissionPrompt = (props: {
  adapter: CallAdapter;
  onClick: () => void;
  onLightDismiss?: () => void;
}): JSX.Element | null => {
  const theme = useTheme();

  const allowButtonStyles = {
    root: {
      minHeight: '3rem',
      borderRadius: theme.effects.roundedCorner6,
      height: '2.5rem',
      width: '100%'
    }
  };

  return (
    <Sheet {...props}>
      <Stack
        horizontalAlign="center"
        styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}
        tokens={{ childrenGap: '0.5rem' }}
      >
        <Stack horizontalAlign="center" styles={{ root: { width: '100%' } }}>
          <CircleBackground backgroundColor={theme.palette.themePrimary}>
            <Video48Filled style={{ color: theme.palette.themePrimary }} />
          </CircleBackground>
        </Stack>
        <Stack horizontalAlign="center" tokens={{ childrenGap: '0.5rem' }}>
          <Stack styles={{ root: { fontSize: theme.fonts.xxLarge.fontSize, fontWeight: '600' } }}>
            {'Allow access to camera'}
          </Stack>
          <Stack
            styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize, color: theme.palette.neutralSecondary } }}
          >
            {'Please allow access to your camera, so it can be turned on for others to see you.'}
          </Stack>
        </Stack>
        <Stack styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}>
          <PrimaryButton onClick={props.onClick} styles={allowButtonStyles}>
            {'Allow access'}
          </PrimaryButton>
        </Stack>
        <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
          {'You will see a popup asking for permissions. Tap "Allow".'}
        </Stack>
      </Stack>
    </Sheet>
  );
};

const VideoPermissionBlocker = (props: { onLightDismiss?: () => void }): JSX.Element | null => {
  const theme = useTheme();

  const buttonStyles = {
    root: {
      minHeight: '3rem',
      borderRadius: theme.effects.roundedCorner6,
      height: '2.5rem',
      width: '100%'
    }
  };

  return (
    <Sheet {...props}>
      <Stack
        horizontalAlign="center"
        styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}
        tokens={{ childrenGap: '0.5rem' }}
      >
        <Stack horizontalAlign="center" styles={{ root: { width: '100%' } }}>
          <CircleBackground backgroundColor={theme.palette.themePrimary}>
            <Video48Filled style={{ color: theme.palette.themePrimary }} />
          </CircleBackground>
        </Stack>
        <Stack verticalAlign="center" tokens={{ childrenGap: '0.5rem' }}>
          <Stack styles={{ root: { fontSize: theme.fonts.xxLarge.fontSize, fontWeight: '600' } }}>
            {'Refresh and allow camera access'}
          </Stack>
          <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
            {'Enable permissions to access your camera, so participants can see you.'}
          </Stack>
        </Stack>
        <Stack horizontalAlign="center" styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}>
          <PrimaryButton
            onClick={() => {
              window.location.reload();
            }}
            styles={buttonStyles}
          >
            {'Refresh page'}
          </PrimaryButton>
        </Stack>
      </Stack>
    </Sheet>
  );
};

const Sheet = (props: { children: React.ReactNode; onLightDismiss?: () => void }): JSX.Element => {
  return (
    <Stack styles={drawerContainerStyles}>
      <_DrawerSurface
        onLightDismiss={() => props.onLightDismiss?.()}
        styles={{ drawerContentContainer: { root: { padding: '2rem 1rem' } } }}
      >
        {props.children}
      </_DrawerSurface>
    </Stack>
  );
};

const CircleBackground = (props: { children: React.ReactNode; backgroundColor: string }): JSX.Element => {
  return (
    <Stack
      styles={{
        root: {
          height: '5.75rem',
          width: '5.75rem',
          position: 'relative'
        }
      }}
      horizontalAlign="center"
      verticalAlign="center"
    >
      {props.children}
      <Stack
        styles={{
          root: {
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
            height: '100%',
            width: '100%',
            borderRadius: '50%',
            background: props.backgroundColor,
            opacity: 0.1
          }
        }}
      />
    </Stack>
  );
};
