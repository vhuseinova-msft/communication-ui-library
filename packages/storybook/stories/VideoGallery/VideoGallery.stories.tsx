// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { VideoGallery as VideoGalleryComponent } from '@azure/communication-react';
import { Canvas, Description, Heading, Subheading, Props, Source, Title } from '@storybook/addon-docs';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';

import { COMPONENT_FOLDER_PREFIX } from '../constants';
import { controlsToAdd, hiddenControl } from '../controlsUtils';
import { CustomAvatarVideoGalleryExample } from './snippets/CustomAvatar.snippet';
import { CustomStyleVideoGalleryExample } from './snippets/CustomStyle.snippet';
import { DefaultVideoGalleryExample } from './snippets/Default.snippet';
import { FloatingLocalVideoExample } from './snippets/FloatingLocalVideo.snippet';
import { WithHorizontalGalleryExample } from './snippets/WithHorizontalGallery.snippet';

const CustomAvatarVideoGalleryExampleText = require('!!raw-loader!./snippets/CustomAvatar.snippet.tsx').default;
const CustomStyleVideoGalleryExampleText = require('!!raw-loader!./snippets/CustomStyle.snippet.tsx').default;
const DefaultVideoGalleryExampleText = require('!!raw-loader!./snippets/Default.snippet.tsx').default;
const FloatingLocalVideoExampleText = require('!!raw-loader!./snippets/FloatingLocalVideo.snippet.tsx').default;
const WithHorizontalGalleryExampleText = require('!!raw-loader!./snippets/WithHorizontalGallery.snippet.tsx').default;

const importStatement = `import { VideoGallery } from '@azure/communication-react';`;

const getDocs: () => JSX.Element = () => {
  return (
    <>
      <Title>VideoGallery</Title>
      <Description>
        The `VideoGallery` component arranges participants in
        [VideoTile](./?path=/docs/ui-components-videotile--video-tile) components
      </Description>

      <Heading>Importing</Heading>
      <Source code={importStatement} />

      <Heading>Example</Heading>
      <Subheading>No participants with videos on</Subheading>
      <Canvas mdxSource={DefaultVideoGalleryExampleText}>
        <DefaultVideoGalleryExample />
      </Canvas>

      <Subheading>Some participants with videos on</Subheading>
      <Description>
        Remote participants with their video and the local participant are placed in a
        [GridLayout](http://localhost:6006/?path=/docs/ui-components-gridlayout--grid-layout). The remaining
        participants, if any, are placed in a HorizontalGallery in the lower section.
      </Description>
      <Canvas mdxSource={WithHorizontalGalleryExampleText}>
        <WithHorizontalGalleryExample />
      </Canvas>
      <Description>
        Note: The `maxRemoteVideoStreams` prop limits the number of remote video streams in the
        [GridLayout](http://localhost:6006/?path=/docs/ui-components-gridlayout--grid-layout). If the number of remote
        participants with their video stream on exceeds `maxRemoteVideoStreams` then remote participnats in the
        `dominantSpeakers` prop will be prioritized. Furthermore, the VideoGallery is designed to limit the re-ordering
        when the `dominantSpeakers` prop is changed.
      </Description>

      <Heading>Floating Local Video Layout</Heading>
      <Description>
        By default, the local participant is placed in the
        [GridLayout](http://localhost:6006/?path=/docs/ui-components-gridlayout--grid-layout). But the local participant
        can be placed in a floating and draggable video tile in the bottom right corner by setting the `layout` prop to
        &apos;floatingLocalVideo&apos;.
      </Description>
      <Canvas mdxSource={FloatingLocalVideoExampleText}>
        <FloatingLocalVideoExample />
      </Canvas>

      <Heading>Custom Avatar</Heading>
      <Description>
        Rendering of avatars can be customized through the VideoGallery callback `onRenderAvatar`.
      </Description>
      <Canvas mdxSource={CustomAvatarVideoGalleryExampleText}>
        <CustomAvatarVideoGalleryExample />
      </Canvas>

      <Heading>Custom Style</Heading>
      <Description>Style of the VideoGallery container can be customized through its `styles` props.</Description>
      <Canvas mdxSource={CustomStyleVideoGalleryExampleText}>
        <CustomStyleVideoGalleryExample />
      </Canvas>

      <Heading>Props</Heading>
      <Props of={VideoGalleryComponent} />
    </>
  );
};

const MockLocalParticipant = {
  userId: 'user1',
  displayName: 'You',
  state: 'Connected',
  isMuted: true
};

const VideoGalleryStory = (args): JSX.Element => {
  const remoteParticipants = args.remoteParticipants
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p)
    .map((p, i) => {
      return {
        userId: `user${i}`,
        displayName: p,
        videoStream: { isAvailable: true }
      };
    });

  return (
    <VideoGalleryComponent
      layout={args.layout}
      localParticipant={MockLocalParticipant}
      remoteParticipants={remoteParticipants}
    />
  );
};

// This must be the only named export from this module, and must be named to match the storybook path suffix.
// This ensures that storybook hoists the story instead of creating a folder with a single entry.
export const VideoGallery = VideoGalleryStory.bind({});

export default {
  id: `${COMPONENT_FOLDER_PREFIX}-videogallery`,
  title: `${COMPONENT_FOLDER_PREFIX}/Video Gallery`,
  component: VideoGalleryComponent,
  argTypes: {
    remoteParticipants: controlsToAdd.remoteParticipantNames,
    layout: controlsToAdd.videoGallerylayout,
    // Hiding auto-generated controls
    styles: hiddenControl,
    localParticipant: hiddenControl,
    localVideoViewOption: hiddenControl,
    remoteVideoViewOption: hiddenControl,
    onCreateLocalStreamView: hiddenControl,
    onDisposeLocalStreamView: hiddenControl,
    onRenderLocalVideoTile: hiddenControl,
    onCreateRemoteStreamView: hiddenControl,
    onRenderRemoteVideoTile: hiddenControl,
    onDisposeRemoteStreamView: hiddenControl,
    onRenderAvatar: hiddenControl,
    showMuteIndicator: hiddenControl,
    dominantSpeakers: hiddenControl
  },
  parameters: {
    docs: {
      page: () => getDocs()
    }
  }
} as Meta;
