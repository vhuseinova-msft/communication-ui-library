// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// eslint-disable-next-line jsdoc/require-jsdoc
export const FakeAdapterState = {
  userId: {
    communicationUserId: '8:acs:dd9753c0-6e62-4f74-ab0f-c94f9723b4eb_00000014-ebce-7f8d-183c-373a0d009437',
    kind: 'communicationUser'
  },
  displayName: 'newUser',
  thread: {
    chatMessages: {
      '1667721126329': {
        id: '1667721126329',
        type: 'participantAdded',
        sequenceId: '16',
        version: '1667721126329',
        content: {
          initiator: {
            kind: 'communicationUser',
            communicationUserId: 'user1'
          },
          participants: [
            {
              displayName: 'user1',
              shareHistoryTime: '1970-01-01T00:00:00.000Z',
              id: {
                kind: 'communicationUser',
                communicationUserId: 'user1'
              }
            }
          ]
        },
        status: 'delivered'
      },
      '1667721126359': {
        id: '1667721126359',
        type: 'participantAdded',
        sequenceId: '17',
        version: '1667721126359',
        content: {
          initiator: {
            kind: 'communicationUser',
            communicationUserId: 'user2'
          },
          participants: [
            {
              displayName: 'user2',
              shareHistoryTime: '1970-01-01T00:00:00.000Z',
              id: {
                kind: 'communicationUser',
                communicationUserId: 'user2'
              }
            }
          ]
        },
        status: 'delivered'
      },
      '1667721153520': {
        id: '1667721153520',
        version: '1667721153520',
        content: {
          message: 'hello'
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
      },
      '1667721153521': {
        id: '1667721153521',
        version: '1667721153521',
        content: {
          message: 'hi'
        },
        type: 'text',
        sender: {
          kind: 'communicationUser',
          communicationUserId: 'user2'
        },
        senderDisplayName: 'user2',
        sequenceId: '',
        metadata: {
          fileSharingMetadata: '[]'
        },
        status: 'delivered'
      }
    },
    threadId: 'testThread',
    properties: {
      id: 'testThread',
      topic: 'Your Chat sample',
      createdBy: {
        kind: 'communicationUser',
        communicationUserId: 'testUser'
      }
    },
    participants: {
      user1: {
        displayName: 'user1',
        shareHistoryTime: '1970-01-01T00:00:00.000Z',
        id: {
          kind: 'communicationUser',
          communicationUserId: 'user1'
        }
      },
      user2: {
        displayName: 'user2',
        shareHistoryTime: '1970-01-01T00:00:00.000Z',
        id: {
          kind: 'communicationUser',
          communicationUserId: 'user2'
        }
      }
    },
    typingIndicators: [],
    readReceipts: [],
    latestReadTime: '2022-11-06T07:52:53.823Z'
  },
  latestErrors: {},
  fileUploads: {}
};
