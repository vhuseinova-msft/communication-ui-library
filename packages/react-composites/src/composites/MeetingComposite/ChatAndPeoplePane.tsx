// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { concatStyleSets, DefaultButton, Stack } from '@fluentui/react';
import { ChevronLeft28Regular } from '@fluentui/react-icons';
import { ParticipantList, useTheme } from '@internal/react-components';
import React, { useMemo } from 'react';
import { CallAdapter } from '../CallComposite';
import { CallAdapterProvider } from '../CallComposite/adapter/CallAdapterProvider';
import { usePropsFor } from '../CallComposite/hooks/usePropsFor';
import { ChatAdapter, ChatComposite } from '../ChatComposite';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { ParticipantListWithHeading } from '../common/ParticipantContainer';
import { useMeetingCompositeStrings } from './hooks/useMeetingCompositeStrings';
import {
  chatAndPeoplePaneButtonStyles,
  chatAndPeoplePaneCloseButtonStyles,
  chatAndPeoplePaneContentHiddenStyle,
  chatAndPeoplePaneContentStyle,
  chatAndPeoplePaneControlBarStyle,
  chatAndPeoplePaneHiddenStyle,
  chatAndPeoplePaneStyle
} from './styles/ChatAndPeoplePaneStyles';

export const ChatAndPeoplePane = (props: {
  chatAdapter: ChatAdapter;
  callAdapter: CallAdapter;
  closePane: () => void;
  toggleChat: () => void;
  togglePeople: () => void;
  activeTab?: ChatAndPeoplePane;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
}): JSX.Element => {
  const { chatAdapter, callAdapter, closePane, toggleChat, togglePeople, onFetchAvatarPersonaData, activeTab } = props;

  const theme = useTheme();
  const meetingStrings = useMeetingCompositeStrings();
  const mobilePaneButtonStylesThemed = concatStyleSets(chatAndPeoplePaneButtonStyles, {
    rootChecked: {
      borderBottom: `0.125rem solid ${theme.palette.themePrimary}`
    }
  });

  return (
    <Stack verticalFill grow className={activeTab ? chatAndPeoplePaneStyle : chatAndPeoplePaneHiddenStyle}>
      <Stack horizontal grow className={chatAndPeoplePaneControlBarStyle}>
        <DefaultButton onClick={closePane} styles={chatAndPeoplePaneCloseButtonStyles}>
          <ChevronLeft28Regular />
        </DefaultButton>
        <DefaultButton
          onClick={() => {
            toggleChat();
          }}
          styles={mobilePaneButtonStylesThemed}
          checked={activeTab === 'chat'}
        >
          {meetingStrings.chatButtonLabel}
        </DefaultButton>
        <DefaultButton
          onClick={() => {
            togglePeople();
          }}
          styles={mobilePaneButtonStylesThemed}
          checked={activeTab === 'people'}
        >
          {meetingStrings.peopleButtonLabel}
        </DefaultButton>
      </Stack>
      <Stack.Item
        className={activeTab === 'people' ? chatAndPeoplePaneContentStyle : chatAndPeoplePaneContentHiddenStyle}
      >
        <CallAdapterProvider adapter={callAdapter}>
          <ParticipantPane
            chatAdapter={chatAdapter}
            callAdapter={callAdapter}
            onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          ></ParticipantPane>
        </CallAdapterProvider>
      </Stack.Item>
      <Stack.Item
        className={activeTab === 'chat' ? chatAndPeoplePaneContentStyle : chatAndPeoplePaneContentHiddenStyle}
      >
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

type ChatAndPeoplePane = 'chat' | 'people';

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
