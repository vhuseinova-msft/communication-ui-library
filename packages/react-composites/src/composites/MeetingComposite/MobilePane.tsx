// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Stack } from '@fluentui/react';
import { ParticipantList } from '@internal/react-components';
import React, { useMemo } from 'react';
import { CallAdapter } from '../CallComposite';
import { usePropsFor } from '../CallComposite/hooks/usePropsFor';
import { ChatAdapter } from '../ChatComposite';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { ParticipantListWithHeading } from '../common/ParticipantContainer';
import { useMeetingCompositeStrings } from './hooks/useMeetingCompositeStrings';

export const MobilePane = (props: { children: React.ReactNode }): JSX.Element => {
  return (
    <Stack verticalFill grow style={{ width: '100%', height: '100%' }}>
      {props.children}
    </Stack>
  );
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
