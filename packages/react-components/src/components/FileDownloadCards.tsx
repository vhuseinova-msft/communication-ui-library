// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Icon, Spinner, SpinnerSize } from '@fluentui/react';
import React, { useCallback, useState } from 'react';
import { FileMetadata, FileDownloadHandler } from '../types';
import { _FileCard } from './FileCard';
import { _FileCardGroup } from './FileCardGroup';
import { extension } from './utils';

/**
 * @internal
 */
export interface _FileDownloadCards {
  /**
   * User id of the local participant
   */
  userId: string;
  /**
   * A chat message metadata that inculdes file metadata
   */
  fileMetadata: FileMetadata[];
  /**
   * A function of type {@link FileDownloadHandler} for handling file downloads.
   * If the function is not specified, the file's `url` will be opened in a new tab to
   * initiate the download.
   */
  downloadHandler?: FileDownloadHandler;
  /**
   * Optional callback that runs if downloadHandler returns {@link FileDownloadError}.
   */
  onDownloadErrorMessage?: (errMsg: string) => void;
}

const fileDownloadCardsStyle = {
  marginTop: '0.25rem'
};

const actionIconStyle = { height: '1rem' };

/**
 * @internal
 */
export const _FileDownloadCards = (props: _FileDownloadCards): JSX.Element => {
  const { userId, fileMetadata } = props;
  const [showSpinner, setShowSpinner] = useState(false);
  const fileDownloadHandler = useCallback(
    async (userId, file) => {
      if (!props.downloadHandler) {
        window.open(file.url, '_blank', 'noopener,noreferrer');
      } else {
        setShowSpinner(true);
        try {
          const response = await props.downloadHandler(userId, file);
          setShowSpinner(false);
          if (response instanceof URL) {
            window.open(response.toString(), '_blank', 'noopener,noreferrer');
          } else {
            props.onDownloadErrorMessage && props.onDownloadErrorMessage(response.errorMessage);
          }
        } finally {
          setShowSpinner(false);
        }
      }
    },
    [props]
  );

  if (!fileMetadata || fileMetadata.length === 0) {
    return <></>;
  }

  return (
    <div style={fileDownloadCardsStyle} data-ui-id="file-download-card-group">
      <_FileCardGroup>
        {fileMetadata &&
          fileMetadata.map((file) => (
            <_FileCard
              fileName={file.name}
              key={file.name}
              fileExtension={extension(file.name)}
              actionIcon={
                showSpinner ? <Spinner size={SpinnerSize.medium} aria-live={'assertive'} /> : <DownloadIconTrampoline />
              }
              actionHandler={() => fileDownloadHandler(userId, file)}
            />
          ))}
      </_FileCardGroup>
    </div>
  );
};

/**
 * @private
 */
const DownloadIconTrampoline = (): JSX.Element => {
  // @conditional-compile-remove(file-sharing)
  return <Icon data-ui-id="file-download-card-download-icon" iconName="DownloadFile" style={actionIconStyle} />;
  // Return _some_ available icon, as the real icon is beta-only.
  return <Icon iconName="EditBoxCancel" style={actionIconStyle} />;
};
