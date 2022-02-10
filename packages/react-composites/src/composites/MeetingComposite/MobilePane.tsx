// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { concatStyleSets, DefaultButton, Stack } from '@fluentui/react';
import { ChevronLeft28Regular } from '@fluentui/react-icons';
import { ParticipantList, useTheme } from '@internal/react-components';
import React, { useMemo, useState } from 'react';
import { CallAdapter } from '../CallComposite';
import { CallAdapterProvider } from '../CallComposite/adapter/CallAdapterProvider';
import { usePropsFor } from '../CallComposite/hooks/usePropsFor';
import { ChatAdapter, ChatComposite } from '../ChatComposite';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { ParticipantListWithHeading } from '../common/ParticipantContainer';
import { useMeetingCompositeStrings } from './hooks/useMeetingCompositeStrings';
import {
  mobilePaneButtonStyles,
  mobilePaneCloseButtonStyles,
  mobilePaneContentStyle,
  mobilePaneControlBarStyle,
  mobilePaneHiddenContentStyle,
  mobilePaneHiddenStyle,
  mobilePaneStyle
} from './styles/MobilePaneStyles';

export const MobilePane = (props: {
  chatAdapter: ChatAdapter;
  callAdapter: CallAdapter;
  closePane: () => void;
  activeTab: MobileTab;
  hidden: boolean;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
}): JSX.Element => {
  const { chatAdapter, callAdapter, closePane, onFetchAvatarPersonaData, hidden, activeTab } = props;

  const [showChat, setShowChat] = useState(activeTab === 'chat');
  const [showPeople, setShowPeople] = useState(activeTab === 'people');

  const theme = useTheme();
  const meetingStrings = useMeetingCompositeStrings();
  const mobilePaneButtonStylesThemed = concatStyleSets(mobilePaneButtonStyles, {
    rootChecked: {
      borderBottom: `0.125rem solid ${theme.palette.themePrimary}`
    }
  });

  return (
    <Stack verticalFill grow className={hidden ? mobilePaneHiddenStyle : mobilePaneStyle}>
      <Stack horizontal grow className={mobilePaneControlBarStyle}>
        <DefaultButton onClick={closePane} styles={mobilePaneCloseButtonStyles}>
          <ChevronLeft28Regular />
        </DefaultButton>
        <DefaultButton
          onClick={() => {
            setShowChat(true);
            setShowPeople(false);
          }}
          styles={mobilePaneButtonStylesThemed}
          checked={showChat}
        >
          {meetingStrings.chatButtonLabel}
        </DefaultButton>
        <DefaultButton
          onClick={() => {
            setShowPeople(true);
            setShowChat(false);
          }}
          styles={mobilePaneButtonStylesThemed}
          checked={showPeople}
        >
          {meetingStrings.peopleButtonLabel}
        </DefaultButton>
      </Stack>
      <Stack.Item className={showPeople ? mobilePaneContentStyle : mobilePaneHiddenContentStyle}>
        <CallAdapterProvider adapter={callAdapter}>
          <ParticipantPane
            chatAdapter={chatAdapter}
            callAdapter={callAdapter}
            onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          ></ParticipantPane>
        </CallAdapterProvider>
      </Stack.Item>
      <Stack.Item className={showChat ? mobilePaneContentStyle : mobilePaneHiddenContentStyle}>
        <ChatComposite
          adapter={chatAdapter}
          fluentTheme={theme}
          options={{ topic: false, /* @conditional-compile-remove-from(stable) */ participantPane: false }}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
        />
      </Stack.Item>
    </Stack>
  );
};

type MobileTab = 'chat' | 'people';

/**
 * @private
 */
export const ParticipantPane = (props: {
  callAdapter: CallAdapter;
  chatAdapter: ChatAdapter;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
}): JSX.Element => {
  const { callAdapter, chatAdapter } = props;
  const participantListDefaultProps = usePropsFor(ParticipantList);

  const meetingStrings = useMeetingCompositeStrings();

  const participantListProps = useMemo(() => {
    const onRemoveParticipant = async (participantId: string): Promise<void> =>
      removeParticipantFromMeeting(callAdapter, chatAdapter, participantId);
    return {
      ...participantListDefaultProps,
      onRemoveParticipant
    };
  }, [participantListDefaultProps, callAdapter, chatAdapter]);

  return (
    <ParticipantListWithHeading
      participantListProps={participantListProps}
      onFetchAvatarPersonaData={props.onFetchAvatarPersonaData}
      title={meetingStrings.peoplePaneSubTitle}
    />
  );
};

/**
 * In a Meeting when a participant is removed, we must remove them from both
 * the call and the chat thread.
 */
const removeParticipantFromMeeting = async (
  callAdapter: CallAdapter,
  chatAdapter: ChatAdapter,
  participantId: string
): Promise<void> => {
  await callAdapter.removeParticipant(participantId);
  await chatAdapter.removeParticipant(participantId);
};
