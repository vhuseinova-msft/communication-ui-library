// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LayerHost, mergeStyles, Stack } from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import { _pxToRem } from '@internal/acs-ui-common';
import React from 'react';
import { useTheme } from '../../theming';
import { GridLayout } from '../GridLayout';
import { isNarrowWidth } from '../utils/responsive';
import { FloatingLocalVideo } from './FloatingLocalVideo';
import { FloatingLocalVideoLayoutProps } from './FloatingLocalVideoLayout';
import {
  localVideoTileContainerStyle,
  localVideoTileWithControlsContainerStyle,
  LOCAL_VIDEO_TILE_ZINDEX,
  SMALL_FLOATING_MODAL_SIZE_PX
} from './styles/FloatingLocalVideo.styles';
import { innerLayoutStyle, layerHostStyle, rootLayoutStyle } from './styles/FloatingLocalVideoLayout.styles';
import { SMALL_HORIZONTAL_GALLERY_TILE_STYLE } from './styles/VideoGalleryResponsiveHorizontalGallery.styles';
import { usePinnedParticipantLayout } from './utils/videoGalleryLayoutUtils';
import { VideoGalleryResponsiveHorizontalGallery } from './VideoGalleryResponsiveHorizontalGallery';

/**
 * Props for {@link PinnedParticipantsLayout}.
 *
 * @private
 */
export interface PinnedParticipantsLayoutProps extends FloatingLocalVideoLayoutProps {
  /**
   * List of pinned participant userIds
   */
  pinnedParticipants?: string[];
  /**
   * Whether local video should be floating
   */
  isLocalVideoFloating?: boolean;
  /**
   * Whether to use horizontal gallery
   */
  useHorizontalGallery?: boolean;
}

/**
 * PinnedParticipantsLayout displays remote participants and a screen sharing component in
 * a grid and horizontal gallery while floating the local video
 *
 * @private
 */
export const PinnedParticipantsLayout = (props: PinnedParticipantsLayoutProps): JSX.Element => {
  const {
    remoteParticipants = [],
    pinnedParticipants = [],
    dominantSpeakers,
    localVideoComponent,
    screenShareComponent,
    onRenderRemoteParticipant,
    styles,
    maxRemoteVideoStreams,
    showCameraSwitcherInLocalPreview,
    parentWidth,
    parentHeight,
    isLocalVideoFloating,
    useHorizontalGallery = true
  } = props;

  const theme = useTheme();

  const isNarrow = parentWidth ? isNarrowWidth(parentWidth) : false;

  const pinnedParticipantsLayout = usePinnedParticipantLayout({
    remoteParticipants,
    pinnedParticipantUserIds: pinnedParticipants,
    dominantSpeakers,
    maxRemoteVideoStreams,
    isScreenShareActive: !!screenShareComponent
  });

  let activeVideoStreams = 0;

  const shouldFloatLocalVideo = isLocalVideoFloating && remoteParticipants.length > 0;

  const gridTiles = pinnedParticipantsLayout.gridParticipants.map((p) => {
    return onRenderRemoteParticipant(
      p,
      maxRemoteVideoStreams && maxRemoteVideoStreams >= 0
        ? p.videoStream?.isAvailable && activeVideoStreams++ < maxRemoteVideoStreams
        : p.videoStream?.isAvailable
    );
  });

  if (localVideoComponent && !shouldFloatLocalVideo) {
    gridTiles.push(localVideoComponent);
  }

  const horizontalGalleryTiles = pinnedParticipantsLayout.horizontalGalleryParticipants.map((p) => {
    return onRenderRemoteParticipant(
      p,
      maxRemoteVideoStreams && maxRemoteVideoStreams >= 0
        ? p.videoStream?.isAvailable && activeVideoStreams++ < maxRemoteVideoStreams
        : p.videoStream?.isAvailable
    );
  });

  const layerHostId = useId('layerhost');

  const wrappedLocalVideoComponent =
    localVideoComponent && shouldFloatLocalVideo ? (
      // When we use showCameraSwitcherInLocalPreview it disables dragging to allow keyboard navigation.
      showCameraSwitcherInLocalPreview ? (
        <Stack
          className={mergeStyles(localVideoTileWithControlsContainerStyle(theme, isNarrow), {
            boxShadow: theme.effects.elevation8,
            zIndex: LOCAL_VIDEO_TILE_ZINDEX
          })}
        >
          {localVideoComponent}
        </Stack>
      ) : horizontalGalleryTiles.length > 0 ? (
        <Stack className={mergeStyles(localVideoTileContainerStyle(theme, isNarrow))}>{localVideoComponent}</Stack>
      ) : (
        <FloatingLocalVideo
          localVideoComponent={localVideoComponent}
          layerHostId={layerHostId}
          isNarrow={isNarrow}
          parentWidth={parentWidth}
          parentHeight={parentHeight}
        />
      )
    ) : undefined;

  return (
    <Stack styles={rootLayoutStyle}>
      {wrappedLocalVideoComponent}
      <Stack horizontal={false} styles={innerLayoutStyle}>
        {screenShareComponent ? (
          screenShareComponent
        ) : (
          <GridLayout key="grid-layout" styles={styles?.gridLayout}>
            {gridTiles}
          </GridLayout>
        )}
        {horizontalGalleryTiles.length > 0 && useHorizontalGallery ? (
          <VideoGalleryResponsiveHorizontalGallery
            isNarrow={isNarrow}
            shouldFloatLocalVideo={true}
            horizontalGalleryElements={horizontalGalleryTiles}
            styles={styles?.horizontalGallery}
          />
        ) : (
          <Stack
            styles={{
              root: {
                paddingTop: '0.5rem',
                width: `calc(100% - ${_pxToRem(SMALL_FLOATING_MODAL_SIZE_PX.width)})`,
                paddingRight: '0.5rem'
              }
            }}
          >
            <Stack
              horizontal={true}
              styles={{
                root: {
                  width: '100%',
                  '> *': SMALL_HORIZONTAL_GALLERY_TILE_STYLE,
                  overflowX: 'auto',
                  '-ms-overflow-style': 'none',
                  'scrollbar-width': 'none',
                  '::-webkit-scrollbar': { display: 'none' }
                }
              }}
              tokens={{ childrenGap: '0.5rem' }}
            >
              {horizontalGalleryTiles}
            </Stack>
          </Stack>
        )}
        <LayerHost id={layerHostId} className={mergeStyles(layerHostStyle)} />
      </Stack>
    </Stack>
  );
};
