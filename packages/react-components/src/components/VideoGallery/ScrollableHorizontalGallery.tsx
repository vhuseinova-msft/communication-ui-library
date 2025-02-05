// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from '@fluentui/react';
import React, { useEffect, useRef } from 'react';
import { useDraggable } from 'react-use-draggable-scroll';
import {
  scrollableHorizontalGalleryContainerStyles,
  scrollableHorizontalGalleryStyles
} from './styles/ScrollableHorizontalGallery.style';
/* @conditional-compile-remove(gallery-layouts) */
import { VideoGalleryLayout } from '../VideoGallery';

/**
 * Component to display elements horizontally in a scrollable container
 * @private
 */
export const ScrollableHorizontalGallery = (props: {
  horizontalGalleryElements?: JSX.Element[];
  onFetchTilesToRender?: (indexes: number[]) => void;
  /* @conditional-compile-remove(gallery-layouts) */
  layout?: VideoGalleryLayout;
}): JSX.Element => {
  const { horizontalGalleryElements, onFetchTilesToRender, /* @conditional-compile-remove(gallery-layouts) */ layout } =
    props;

  const useFullWidthTrampoline = (): boolean => {
    /* @conditional-compile-remove(gallery-layouts) */
    return layout === 'default' ? true : false;
    return false;
  };

  useEffect(() => {
    const indexesArray = [...Array(horizontalGalleryElements?.length).keys()];
    if (onFetchTilesToRender && indexesArray) {
      onFetchTilesToRender(indexesArray);
    }
  }, [onFetchTilesToRender, horizontalGalleryElements?.length]);

  const ref = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { events: dragabbleEvents } = useDraggable(ref);

  return (
    <div
      ref={ref}
      {...dragabbleEvents}
      className={scrollableHorizontalGalleryContainerStyles(useFullWidthTrampoline())}
    >
      <Stack
        data-ui-id="scrollable-horizontal-gallery"
        horizontal={true}
        styles={scrollableHorizontalGalleryStyles}
        tokens={{ childrenGap: '0.5rem' }}
      >
        {horizontalGalleryElements}
      </Stack>
    </div>
  );
};
