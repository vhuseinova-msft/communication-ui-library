// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Message, MessageAttachedStatus } from '@internal/react-components';
import { compareMessages } from './compareMessages';
import { MINUTE_IN_MS } from './constants';

/**
 * @private
 */
export const updateMessagesWithAttached = (chatMessagesWithStatus: Message[]): void => {
  chatMessagesWithStatus.sort(compareMessages);

  chatMessagesWithStatus.forEach((message, index, messages) => {
    if (message.messageType !== 'chat') {
      return;
    }
    /**
     * Attached === true means it is within a group of messages in the current order
     * Attached === top/bottom means it is on the top/bottom boundary
     * Attached === false means it is just a single message
     * A group of messages: continuous messages that belong to the same sender and not intercepted by other senders.
     */
    let attached: boolean | MessageAttachedStatus = false;
    const previousMessage = index > 0 ? messages[index - 1] : undefined;
    const nextMessage = index === messages.length - 1 ? undefined : messages[index + 1];

    const previousSenderId = previousMessage?.messageType === 'chat' ? previousMessage.senderId : undefined;
    const nextSenderId = nextMessage?.messageType === 'chat' ? nextMessage.senderId : undefined;

    const previousSenderDisplayName =
      previousMessage?.messageType === 'chat' ? previousMessage.senderDisplayName : undefined;
    const nextSenderDisplayName = nextMessage?.messageType === 'chat' ? nextMessage.senderDisplayName : undefined;

    const timediff =
      new Date(message?.createdOn ?? '').getTime() - new Date(previousMessage?.createdOn ?? '').getTime();

    const diffMins = Math.round(timediff / MINUTE_IN_MS); // minutes

    if (previousSenderId !== message.senderId) {
      attached =
        message.senderId === nextSenderId && message.senderDisplayName === nextSenderDisplayName ? 'top' : false;
    } else if (diffMins && diffMins >= 5) {
      // if there are more than or equal to 5 mins time gap between messages do not attach and show time stamp
      attached = false;
    } else if (message.senderDisplayName !== previousSenderDisplayName) {
      attached =
        message.senderId === nextSenderId && message.senderDisplayName === nextSenderDisplayName ? 'top' : false;
    } else {
      attached = message.senderId === nextSenderId ? true : 'bottom';
    }

    message.attached = attached;
  });
};
