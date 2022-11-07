// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { SendMessageOptions } from '@azure/communication-chat';
import { FileMetadata } from '@internal/react-components';
import { AdapterError } from '../../common/adapters';
import { FileUploadManager } from '../file-sharing';
import {
  ChatAdapter,
  ChatAdapterState,
  MessageReadListener,
  MessageReceivedListener,
  ParticipantsAddedListener,
  ParticipantsRemovedListener,
  TopicChangedListener
} from './ChatAdapter';
import { FakeAdapterState } from './FakeAdapterState';

/**
 * @public
 */
export class FakeChatAdapter implements ChatAdapter {
  private state;
  constructor() {
    this.state = {
      userId: { communicationUserId: 'testUserID' },
      thread: {
        threadId: 'testThreadID',
        readReceipts: []
      },
      latestErrors: {}
    };
    this.state = FakeAdapterState;
    this.sendMessage = this.sendMessage.bind(this);
  }

  fetchInitialData(): Promise<void> {
    console.log('fetchInitialData');
    return this.state;
  }
  sendMessage(content: string, options?: SendMessageOptions | undefined): Promise<void> {
    console.log('send message' + content + options);
    this.state.thread.chatMessages['1667721153521'] = {
      id: '1667721153521',
      version: '1667721153521',
      content: {
        message: content
      },
      type: 'text',
      sender: {
        kind: 'communicationUser',
        communicationUserId: 'user1'
      },
      senderDisplayName: 'user1',
      sequenceId: '',
      metadata: {
        fileSharingMetadata: '[]'
      },
      status: 'delivered'
    };
    return this.state;
  }
  sendReadReceipt(chatMessageId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendTypingIndicator(): Promise<void> {
    console.log('sendTypingIndicator');
    return this.state;
  }
  removeParticipant(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  setTopic(topicName: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getState(): ChatAdapterState {
    return this.state;
  }
  updateMessage(
    messageId: string,
    content: string,
    metadata?: Record<string, string> | undefined,
    options?: { attachedFilesMetadata?: FileMetadata[] | undefined } | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteMessage(messageId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  loadPreviousChatMessages(messagesToLoad: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  onStateChange(handler: (state: ChatAdapterState) => void): void {
    console.log('state changed' + handler);
  }
  offStateChange(handler: (state: ChatAdapterState) => void): void {
    throw new Error('Method not implemented.');
  }
  dispose(): void {
    throw new Error('Method not implemented.');
  }
  on(event: 'messageReceived', listener: MessageReceivedListener): void;
  on(event: 'messageSent', listener: MessageReceivedListener): void;
  on(event: 'messageRead', listener: MessageReadListener): void;
  on(event: 'participantsAdded', listener: ParticipantsAddedListener): void;
  on(event: 'participantsRemoved', listener: ParticipantsRemovedListener): void;
  on(event: 'topicChanged', listener: TopicChangedListener): void;
  on(event: 'error', listener: (e: AdapterError) => void): void;
  on(event: unknown, listener: unknown): void {
    throw new Error('Method not implemented.');
  }
  off(event: 'messageReceived', listener: MessageReceivedListener): void;
  off(event: 'messageSent', listener: MessageReceivedListener): void;
  off(event: 'messageRead', listener: MessageReadListener): void;
  off(event: 'participantsAdded', listener: ParticipantsAddedListener): void;
  off(event: 'participantsRemoved', listener: ParticipantsRemovedListener): void;
  off(event: 'topicChanged', listener: TopicChangedListener): void;
  off(event: 'error', listener: (e: AdapterError) => void): void;
  off(event: unknown, listener: unknown): void {
    throw new Error('Method not implemented.');
  }
  registerActiveFileUploads(files: File[]): FileUploadManager[] {
    console.log(files);
    return [];
  }
  registerCompletedFileUploads!: (metadata: FileMetadata[]) => FileUploadManager[];
  clearFileUploads!: () => void;
  cancelFileUpload!: (id: string) => void;
  updateFileUploadProgress!: (id: string, progress: number) => void;
  updateFileUploadErrorMessage!: (id: string, errorMessage: string) => void;
  updateFileUploadMetadata!: (id: string, metadata: FileMetadata) => void;
}
