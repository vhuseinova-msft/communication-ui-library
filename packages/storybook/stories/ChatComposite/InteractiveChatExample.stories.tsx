// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { COMPOSITE_LOCALE_FR_FR } from '@azure/communication-react';
import { ChatComposite, darkTheme } from '@azure/communication-react';
import { Stack } from '@fluentui/react';
import { TestChatAdapter, InMemoryChatClient, TestChatParticipant } from '@internal/react-composites';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { COMPOSITE_FOLDER_PREFIX, compositeExperienceContainerStyle } from '../constants';
import { defaultChatCompositeHiddenControls, controlsToAdd } from '../controlsUtils';
import { getDocs } from './ChatCompositeDocs';

const InteractiveChatStory = (args, context): JSX.Element => {
  console.log(TestChatAdapter);
  const alice: TestChatParticipant = { id: 'aliceID', displayName: 'Alice' };
  const bob: TestChatParticipant = { id: 'bobID', displayName: 'Bob' };
  const testChatClient = new InMemoryChatClient({
    chatMessages: {
      initialMessage: {
        id: 'initialMessage',
        sender: { kind: 'communicationUser', communicationUserId: alice.id },
        senderDisplayName: alice.displayName,
        sequenceId: '0',
        type: 'text',
        version: '',
        createdOn: new Date(),
        content: {
          message: 'Hi Bob!'
        },
        status: 'delivered'
      }
    },
    participants: {
      [alice.id]: { id: { communicationUserId: alice.id }, displayName: alice.displayName },
      [bob.id]: { id: { communicationUserId: bob.id }, displayName: bob.displayName }
    },
    threadId: 'abc123',
    properties: {
      topic: 'My fake chat 🐢'
    },
    readReceipts: [],
    typingIndicators: [],
    latestReadTime: new Date()
  });
  const aliceAdapter = new TestChatAdapter(alice, testChatClient);
  const bobAdapter = new TestChatAdapter(bob, testChatClient);

  return (
    <Stack horizontal horizontalAlign="space-evenly" verticalFill styles={compositeExperienceContainerStyle}>
      <Stack.Item styles={{ root: { width: '50%', padding: '5%' } }}>
        <ChatComposite adapter={aliceAdapter} locale={COMPOSITE_LOCALE_FR_FR} />
      </Stack.Item>
      <Stack.Item styles={{ root: { width: '50%', padding: '5%', background: darkTheme.palette?.white } }}>
        <ChatComposite adapter={bobAdapter} fluentTheme={darkTheme} />
      </Stack.Item>
    </Stack>
  );
};

export const InteractiveChatExample = InteractiveChatStory.bind({});

export default {
  id: `${COMPOSITE_FOLDER_PREFIX}-chat-interactivechatexample`,
  title: `${COMPOSITE_FOLDER_PREFIX}/ChatComposite/Interactive Chat Example`,
  component: ChatComposite,
  argTypes: {
    ...defaultChatCompositeHiddenControls
  },
  parameters: {
    useMaxHeightParent: true,
    useMaxWidthParent: true,
    docs: {
      page: () => getDocs()
    }
  }
} as Meta;
