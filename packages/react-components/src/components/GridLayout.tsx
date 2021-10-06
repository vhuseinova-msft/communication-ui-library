// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { mergeStyles } from '@fluentui/react';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { BaseCustomStylesProps } from '../types';
import { gridLayoutStyle } from './styles/GridLayout.styles';
import { calculateGridProps, GridProps } from './utils/GridLayoutUtils';

/**
 * Props for {@link GridLayout}.
 *
 * @public
 */
export interface GridLayoutProps {
  children: React.ReactNode;
  /**
   * Allows users to pass in an object contains custom CSS styles.
   * @Example
   * ```
   * <GridLayout styles={{ root: { background: 'blue' } }} />
   * ```
   */
  styles?: BaseCustomStylesProps;
}

/**
 * A component to lay out audio / video participants tiles in a call.
 *
 * @public
 */
export const GridLayout = (props: GridLayoutProps): JSX.Element => {
  const { children, styles } = props;
  const numberOfChildren = React.Children.count(children);

  const containerRef = useRef<HTMLDivElement>(null);
  const [gridProps, setGridProps] = useState<GridProps>({
    horizontalFill: true,
    rows: Math.ceil(Math.sqrt(numberOfChildren)),
    columns: Math.ceil(Math.sqrt(numberOfChildren))
  });

  useEffect(() => {
    const updateDynamicGridStyles = (): void => {
      if (containerRef.current) {
        setGridProps(
          calculateGridProps(numberOfChildren, containerRef.current.offsetWidth, containerRef.current.offsetHeight)
        );
      }
    };
    const observer = new ResizeObserver(updateDynamicGridStyles);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    updateDynamicGridStyles();
    return () => observer.disconnect();
  }, [numberOfChildren, containerRef.current?.offsetWidth, containerRef.current?.offsetHeight]);

  const blockGroup = useMemo(() => BlockGroup({ children, gridProps }), [children, gridProps]);

  return (
    <div ref={containerRef} className={mergeStyles(gridLayoutStyle, styles?.root)}>
      {blockGroup}
    </div>
  );
};

const BlockGroup = (props: { children: React.ReactNode } & { gridProps: GridProps }): JSX.Element => {
  console.log('rendering BlockGroup');
  const gridProps = props.gridProps;
  const numberOfChildren = React.Children.count(props.children);

  const blocks = gridProps.horizontalFill ? gridProps.rows : gridProps.columns;
  const smallCellsPerBlock = Math.ceil(numberOfChildren / blocks);
  const bigCellsPerBlock = Math.floor(numberOfChildren / blocks);
  const numBigCells = (gridProps.rows * gridProps.columns - numberOfChildren) * bigCellsPerBlock;
  const numSmallChildren = numberOfChildren - numBigCells;
  const blocksForBigCells = numBigCells / bigCellsPerBlock;
  const blocksForSmallCells = blocks - blocksForBigCells;

  const smallChildren = (
    <div
      style={
        gridProps.horizontalFill
          ? {
              display: 'grid',
              width: '100%',
              height: `${Math.floor((blocksForSmallCells * 100) / blocks)}%`,
              gridTemplateColumns: `repeat(${smallCellsPerBlock}, 1fr)`,
              gridTemplateRows: `repeat(${blocksForSmallCells}, 1fr)`
            }
          : {
              display: 'grid',
              width: `${Math.floor((blocksForSmallCells * 100) / blocks)}%`,
              height: '100%',
              float: 'left',
              gridTemplateRows: `repeat(${smallCellsPerBlock}, 1fr)`,
              gridTemplateColumns: `repeat(${blocksForSmallCells}, 1fr)`
            }
      }
    >
      {React.Children.toArray(props.children).slice(0, numSmallChildren)}
    </div>
  );
  const bigChildren = numBigCells ? (
    <div
      style={
        gridProps.horizontalFill
          ? {
              display: 'grid',
              width: '100%',
              height: `${Math.floor((blocksForBigCells * 100) / blocks)}%`,
              gridTemplateColumns: `repeat(${bigCellsPerBlock}, 1fr)`,
              gridTemplateRows: `repeat(${blocksForBigCells}, 1fr)`
            }
          : {
              display: 'grid',
              width: `${Math.floor((blocksForBigCells * 100) / blocks)}%`,
              height: '100%',
              float: 'left',
              gridTemplateRows: `repeat(${bigCellsPerBlock}, 1fr)`,
              gridTemplateColumns: `repeat(${blocksForBigCells}, 1fr)`
            }
      }
    >
      {React.Children.toArray(props.children).slice(numSmallChildren)}
    </div>
  ) : null;

  return numBigCells ? (
    <div className={mergeStyles({ width: '100%', height: '100%' })}>
      {smallChildren}
      {bigChildren}
    </div>
  ) : (
    smallChildren
  );
};
