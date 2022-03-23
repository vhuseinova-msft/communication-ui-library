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
  const {
    adapter,
    callInvitationUrl,
    onFetchAvatarPersonaData,
    onFetchParticipantMenuItems,
    options,
    formFactor = 'desktop'
  } = props;

  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      if (devices.every((device) => device.label === '')) {
        setShowDrawer(true);
      } else {
        adapter.askDevicePermission({ video: true, audio: true });
        adapter.queryCameras();
        adapter.queryMicrophones();
        adapter.querySpeakers();
      }
    });
    const update = (newState: CallAdapterState): void => {
      if (newState.devices.deviceAccess?.audio && newState.devices.deviceAccess?.video) {
        setShowDrawer(false);
      }
    };
    adapter.onStateChange(update);
    return () => {
      adapter.offStateChange(update);
    };
  }, [adapter]);

  const mobileView = formFactor === 'mobile';

  const mainScreenContainerClassName = useMemo(() => {
    return mobileView ? mainScreenContainerStyleMobile : mainScreenContainerStyleDesktop;
  }, [mobileView]);

  return (
    <div className={mainScreenContainerClassName}>
      <BaseProvider {...props}>
        <CallAdapterProvider adapter={adapter}>
          <MainScreen
            callInvitationUrl={callInvitationUrl}
            onFetchAvatarPersonaData={onFetchAvatarPersonaData}
            onFetchParticipantMenuItems={onFetchParticipantMenuItems}
            mobileView={mobileView}
            options={options}
          />
          {showDrawer && mobileView && (
            <PermissionsPrompt adapter={adapter} onLightDismiss={() => setShowDrawer(false)} />
          )}
        </CallAdapterProvider>
      </BaseProvider>
    </div>
  );
};

const PermissionsPrompt = (props: { adapter: CallAdapter; onLightDismiss: () => void }): JSX.Element | null => {
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
        onLightDismiss={onLightDismiss}
        styles={{ drawerContentContainer: { root: { padding: '2rem 1rem' } } }}
      >
        <Stack horizontalAlign="center" tokens={{ childrenGap: '1.5rem' }}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: '0.5rem' }}>
            <Stack
              styles={{
                root: {
                  height: '5.75rem',
                  width: '5.75rem',
                  borderRadius: '50%',
                  background: theme.palette.blueLight
                }
              }}
              horizontalAlign="center"
              verticalAlign="center"
            >
              <Video48Filled style={{ color: theme.palette.themePrimary }} />
            </Stack>
            <Icon icon="fluent:sparkle-48-filled" />
            <Stack
              styles={{
                root: {
                  height: '5.75rem',
                  width: '5.75rem',
                  borderRadius: '50%',
                  background: theme.palette.blueLight
                }
              }}
              horizontalAlign="center"
              verticalAlign="center"
            >
              <MicOn48Filled style={{ color: theme.palette.themePrimary }} />
            </Stack>
          </Stack>
          <Stack
            horizontalAlign="center"
            styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}
            tokens={{ childrenGap: '0.5rem' }}
          >
            <Stack styles={{ root: { fontSize: theme.fonts.xxLarge.fontSize, fontWeight: '600' } }}>
              {'Allow access to camera & microphone'}
            </Stack>
            <Stack styles={{ root: { fontSize: theme.fonts.mediumPlus.fontSize } }}>
              {'Enabling these permissions allows other participants to see and hear you.'}
            </Stack>
          </Stack>
          <Stack styles={{ root: { width: '100%', padding: '0.5rem 1rem' } }}>
            <PrimaryButton
              onClick={() => {
                adapter.askDevicePermission({ video: true, audio: true });
              }}
              styles={allowButtonStyles}
            >
              Allow (Required)
            </PrimaryButton>
          </Stack>
        </Stack>
      </_DrawerSurface>
    </Stack>
  );
};
