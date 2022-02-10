// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { concatStyleSets, DefaultButton, IButtonStyles, Stack } from '@fluentui/react';
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

export const MobilePane = (props: {
  chatAdapter: ChatAdapter;
  callAdapter: CallAdapter;
  closePane: () => void;
  activeTab: MobileTab;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
}): JSX.Element => {
  const { chatAdapter, callAdapter, closePane, onFetchAvatarPersonaData, activeTab } = props;

  const [showChat, setShowChat] = useState(activeTab === 'chat');
  const [showPeople, setShowPeople] = useState(activeTab === 'people');

  const theme = useTheme();
  const strings = useMeetingCompositeStrings();
  const mobilePaneButtonStylesThemed = concatStyleSets(mobilePaneButtonStyles, {
    rootChecked: {
      borderBottom: `0.125rem solid ${theme.palette.themePrimary}`
    }
  });

  return (
    <Stack verticalFill grow style={{ width: '100%', height: '100%' }}>
      <Stack horizontal grow style={{ height: '3rem' }}>
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
          {strings.chatButtonLabel}
        </DefaultButton>
        <DefaultButton
          onClick={() => {
            setShowPeople(true);
            setShowChat(false);
          }}
          styles={mobilePaneButtonStylesThemed}
          checked={showPeople}
        >
          {strings.peopleButtonLabel}
        </DefaultButton>
      </Stack>
      {showPeople && (
        <CallAdapterProvider adapter={callAdapter}>
          <ParticipantPane
            chatAdapter={chatAdapter}
            callAdapter={callAdapter}
            onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          ></ParticipantPane>
        </CallAdapterProvider>
      )}
      {showChat && (
        <ChatComposite
          adapter={chatAdapter}
          fluentTheme={theme}
          options={{ topic: false, /* @conditional-compile-remove-from(stable) */ participantPane: false }}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
        />
      )}
    </Stack>
  );
};

type MobileTab = 'chat' | 'people';

const mobilePaneButtonStyles: IButtonStyles = {
  root: {
    border: 'none',
    borderBottom: '0.125rem solid transparent',
    width: '6.75rem',
    borderRadius: 'none',
    height: '100%',
    background: 'none'
  },
  rootChecked: { background: 'none' },
  rootCheckedHovered: { background: 'none' }
};

const mobilePaneCloseButtonStyles: IButtonStyles = {
  root: { border: 'none', minWidth: '1rem', height: '100%', background: 'none' }
};

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
