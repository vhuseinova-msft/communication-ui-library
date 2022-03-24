// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { _isInCall } from '@internal/calling-component-bindings';
import {
  OnRenderAvatarCallback,
  ParticipantMenuItemsCallback,
  useTheme,
  _DrawerSurface
} from '@internal/react-components';
import React, { useEffect, useMemo, useState } from 'react';
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
import { Video48Filled, MicOn48Filled } from '@fluentui/react-icons';
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
    'permissionNeeded' | 'permissionDenied' | 'noPermissionNeeded'
  >('noPermissionNeeded');

  const [videoPermissionState, setVideoPermissionState] = useState<
    'permissionNeeded' | 'permissionDenied' | 'noPermissionNeeded'
  >('noPermissionNeeded');

  useEffect(() => {
    navigator.permissions.query({ name: 'microphone' }).then(function (result) {
      console.log('microphone result.state ', result.state);
      if (result.state === 'granted') {
        adapter.askDevicePermission({ video: false, audio: true });
        adapter.queryMicrophones();
        adapter.querySpeakers();
      } else if (result.state === 'prompt') {
        setMicrophonePermissionsState('permissionNeeded');
      } else if (result.state === 'denied') {
        setMicrophonePermissionsState('permissionDenied');
      }
    });
    navigator.permissions.query({ name: 'camera' }).then(function (result) {
      console.log('camera result.state ', result.state);
      if (result.state === 'granted') {
        adapter.askDevicePermission({ video: true, audio: false });
        adapter.queryCameras();
      }
    });
    const update = (newState: CallAdapterState): void => {
      if (newState.devices.deviceAccess?.audio) {
        setMicrophonePermissionsState('noPermissionNeeded');
      } else if (newState.devices.deviceAccess?.audio === false) {
        setMicrophonePermissionsState('permissionDenied');
      }
      if (newState.devices.deviceAccess?.video) {
        setVideoPermissionState('noPermissionNeeded');
      }
    };
    adapter.onStateChange(update);
    return () => {
      adapter.offStateChange(update);
    };
  }, [adapter]);

  const mobileView = formFactor === 'mobile';

  let drawer: JSX.Element | null = null;
  if (microphonePermissionState === 'permissionNeeded') {
    drawer = <MicrophonePermissionPrompt adapter={adapter} />;
  } else if (microphonePermissionState === 'permissionDenied') {
    drawer = <MicrophonePermissionBlocker />;
  } else if (videoPermissionState === 'permissionNeeded') {
    drawer = (
      <VideoPermissionPrompt adapter={adapter} onLightDismiss={() => setVideoPermissionState('noPermissionNeeded')} />
    );
  } else if (videoPermissionState === 'permissionDenied') {
    drawer = <VideoPermissionBlocker onLightDismiss={() => setVideoPermissionState('noPermissionNeeded')} />;
  }

  return (
    <Stack styles={{ root: { width: '100%', height: '100%' } }}>
      <MainScreen
        callInvitationUrl={callInvitationUrl}
        onFetchAvatarPersonaData={onFetchAvatarPersonaData}
        onFetchParticipantMenuItems={onFetchParticipantMenuItems}
        mobileView={mobileView}
        options={options}
        videoPermissionsDeniedOnClick={() => setVideoPermissionState('permissionNeeded')}
      />
      {drawer}
    </Stack>
  );
};

const MicrophonePermissionPrompt = (props: {
  adapter: CallAdapter;
  onLightDismiss?: () => void;
}): JSX.Element | null => {
  const { adapter, onLightDismiss } = props;

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
    <Stack styles={drawerContainerStyles}>
      <_DrawerSurface
        onLightDismiss={() => onLightDismiss?.()}
        styles={{ drawerContentContainer: { root: { padding: '2rem 1rem' } } }}
      >
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
            <PrimaryButton
              onClick={() => {
                adapter.askDevicePermission({ video: false, audio: true });
              }}
              styles={allowButtonStyles}
            >
              {'Allow access'}
            </PrimaryButton>
          </Stack>
          <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
            {'You will see a popup asking for permissions. Tap "Allow".'}
          </Stack>
        </Stack>
      </_DrawerSurface>
    </Stack>
  );
};

const MicrophonePermissionBlocker = (props: { onLightDismiss?: () => void }): JSX.Element | null => {
  const { onLightDismiss } = props;

  const theme = useTheme();

  return (
    <Stack styles={drawerContainerStyles}>
      <_DrawerSurface
        onLightDismiss={() => onLightDismiss?.()}
        styles={{ drawerContentContainer: { root: { padding: '2rem 1rem' } } }}
      >
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
        </Stack>
      </_DrawerSurface>
    </Stack>
  );
};

const VideoPermissionPrompt = (props: { adapter: CallAdapter; onLightDismiss?: () => void }): JSX.Element | null => {
  const { adapter, onLightDismiss } = props;

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
    <Stack styles={drawerContainerStyles}>
      <_DrawerSurface
        onLightDismiss={() => onLightDismiss?.()}
        styles={{ drawerContentContainer: { root: { padding: '2rem 1rem' } } }}
      >
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
            <PrimaryButton
              onClick={() => {
                adapter.askDevicePermission({ video: true, audio: false });
              }}
              styles={allowButtonStyles}
            >
              {'Allow access'}
            </PrimaryButton>
          </Stack>
          <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
            {'You will see a popup asking for permissions. Tap "Allow".'}
          </Stack>
        </Stack>
      </_DrawerSurface>
    </Stack>
  );
};

const VideoPermissionBlocker = (props: { onLightDismiss?: () => void }): JSX.Element | null => {
  const { onLightDismiss } = props;

  const theme = useTheme();

  return (
    <Stack styles={drawerContainerStyles}>
      <_DrawerSurface
        onLightDismiss={() => onLightDismiss?.()}
        styles={{ drawerContentContainer: { root: { padding: '2rem 1rem' } } }}
      >
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
        </Stack>
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
