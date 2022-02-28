// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { DefaultButton, FontIcon, IContextualMenuItem, IIconProps, PrimaryButton, Stack } from '@fluentui/react';
import {
  ParticipantItemProps,
  ParticipantList,
  ParticipantListProps,
  _DrawerMenu,
  _DrawerMenuItemProps
} from '@internal/react-components';
import copy from 'copy-to-clipboard';
import React, { useMemo, useState, useCallback } from 'react';
import { CallAdapter } from '../CallComposite';
import { usePropsFor } from '../CallComposite/hooks/usePropsFor';
import { ChatAdapter } from '../ChatComposite';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { ParticipantListWithHeading } from '../common/ParticipantContainer';
import { peoplePaneContainerStyle, peoplePaneContainerTokens } from '../common/styles/ParticipantContainer.styles';
import { useCallWithChatCompositeStrings } from './hooks/useCallWithChatCompositeStrings';
import { MobilePane } from './MobilePane';
import { SidePane } from './SidePane';
import { drawerContainerStyles } from './styles/CallWithChatCompositeStyles';
import { copyLinkButtonStyles, linkIconStyles } from './styles/EmbeddedPeoplePane.styles';

/**
 * @private
 */
export const EmbeddedPeoplePane = (props: {
  inviteLink?: string;
  onClose: () => void;
  hidden: boolean;
  callAdapter: CallAdapter;
  chatAdapter: ChatAdapter;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
  onChatButtonClick: () => void;
  onPeopleButtonClick: () => void;
  mobileView?: boolean;
}): JSX.Element => {
  const { callAdapter, chatAdapter, inviteLink } = props;
  const participantListDefaultProps = usePropsFor(ParticipantList);

  const callWithChatStrings = useCallWithChatCompositeStrings();

  const [menuItems, setMenuItems] = useState<_DrawerMenuItemProps[]>([]);

  const convertContextualMenuItemToDrawerMenuItem = useCallback(
    (contextualMenu: IContextualMenuItem): _DrawerMenuItemProps => {
      return {
        itemKey: contextualMenu.key,
        onItemClick: () => {
          contextualMenu.onClick?.();
          setMenuItems([]);
        },
        iconProps: contextualMenu.iconProps ?? fetchDrawerMenuIcon(contextualMenu.key),
        text: contextualMenu.text,
        disabled: contextualMenu.disabled
      };
    },
    [setMenuItems]
  );

  const participantListProps: ParticipantListProps = useMemo(() => {
    const onRemoveParticipant = async (participantId: string): Promise<void> =>
      removeParticipantFromCallWithChat(callAdapter, chatAdapter, participantId);
    return {
      ...participantListDefaultProps,
      onRemoveParticipant,
      onParticipantItemClick: props.mobileView
        ? (participantItemProps?: ParticipantItemProps) => {
            if (participantItemProps?.menuItems) {
              setMenuItems(
                participantItemProps.menuItems.map((contextualMenu: IContextualMenuItem): _DrawerMenuItemProps => {
                  return convertContextualMenuItemToDrawerMenuItem(contextualMenu);
                })
              );
            }
          }
        : undefined
    };
  }, [participantListDefaultProps, callAdapter, chatAdapter]);

  const participantList = (
    <ParticipantListWithHeading
      participantListProps={participantListProps}
      onFetchAvatarPersonaData={props.onFetchAvatarPersonaData}
      title={callWithChatStrings.peoplePaneSubTitle}
    />
  );

  if (props.mobileView) {
    return (
      <MobilePane
        hidden={props.hidden}
        dataUiId={'call-with-chat-composite-people-pane'}
        onClose={props.onClose}
        activeTab="people"
        onChatButtonClicked={props.onChatButtonClick}
        onPeopleButtonClicked={props.onPeopleButtonClick}
      >
        <Stack verticalFill styles={peoplePaneContainerStyle} tokens={peoplePaneContainerTokens}>
          {participantList}
          {inviteLink && (
            <PrimaryButton
              onClick={() => copy(inviteLink)}
              styles={copyLinkButtonStyles}
              onRenderIcon={() => <FontIcon iconName="Link" style={linkIconStyles} />}
              text={callWithChatStrings.copyInviteLinkButtonLabel}
            />
          )}
        </Stack>
        {menuItems.length > 0 && (
          <Stack styles={drawerContainerStyles}>
            <_DrawerMenu onLightDismiss={() => setMenuItems([])} items={menuItems} />
          </Stack>
        )}
      </MobilePane>
    );
  }

  return (
    <SidePane
      hidden={props.hidden}
      headingText={callWithChatStrings.peoplePaneTitle}
      onClose={props.onClose}
      dataUiId={'call-with-chat-composite-people-pane'}
    >
      <Stack tokens={peoplePaneContainerTokens}>
        {inviteLink && (
          <DefaultButton text="Copy invite link" iconProps={{ iconName: 'Link' }} onClick={() => copy(inviteLink)} />
        )}
        {participantList}
      </Stack>
    </SidePane>
  );
};

/**
 * In a CallWithChat when a participant is removed, we must remove them from both
 * the call and the chat thread.
 */
const removeParticipantFromCallWithChat = async (
  callAdapter: CallAdapter,
  chatAdapter: ChatAdapter,
  participantId: string
): Promise<void> => {
  await callAdapter.removeParticipant(participantId);
  await chatAdapter.removeParticipant(participantId);
};

/**
 * Provide {@link IIconProps} for certain contextual menu item keys
 * @param key - key of contextual menu item
 * @returns IIconProps
 */
const fetchDrawerMenuIcon = (key: string): IIconProps => {
  switch (key) {
    case 'remove':
      return { iconName: 'UserRemove' };
    default:
      return {};
  }
};
