// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import React from 'react';

/**
 * @private
 */
export interface FileDownloadErrorBarProps {
  /**callback to dismiss the download error message */
  onDismissDownloadErrorMessage: () => void;
  /** Error message to render */
  fileDownloadErrorMessage: string;
}
const messageBarIconProps = { iconName: 'ProtectedDocument' };
/**
 * @private
 */
export const FileDownloadErrorBar = (props: FileDownloadErrorBarProps): JSX.Element => {
  const { fileDownloadErrorMessage, onDismissDownloadErrorMessage } = props;

  if (fileDownloadErrorMessage === '') {
    return <></>;
  } else {
    return (
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <MessageBar
          messageBarType={MessageBarType.warning}
          onDismiss={() => {
            onDismissDownloadErrorMessage();
          }}
          messageBarIconProps={messageBarIconProps}
        >
          {fileDownloadErrorMessage}
        </MessageBar>
      </Stack>
    );
  }
};
