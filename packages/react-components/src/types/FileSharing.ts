// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Meta Data containing information about the uploaded file.
 * @beta
 */
export interface FileMetadata {
  /**
   * File name to be displayed.
   */
  name: string;
  /**
   * Extension is used for rendering the file icon.
   * An unknown extension will be rendered as a generic icon.
   * Example: `jpeg`
   */
  extension: string;
  /**
   * Download URL for the file.
   */
  url: string;
}

/**
 * @beta
 * A file download error returned via a {@link FileDownloadHandler}.
 * This error message is used to render an error message in the UI.
 */
export interface FileDownloadError {
  /** The error message to display in the UI */
  errorMessage: string;
}

/**
 * @beta
 *
 * A callback function for handling file downloads.
 * The function needs to return a promise that resolves to a file download URL.
 * If the promise is rejected, the {@link Error.message} will be used to display an error message to the user.
 *
 * @example
 * ```ts
 * const fileDownloadHandler: FileDownloadHandler = async (userId, fileData) => {
 *   if (isUnauthorizedUser(userId)) {
 *     return { errorMessage: 'You don’t have permission to download this file.' };
 *   } else {
 *     return new URL(fileData.url);
 *   }
 * }
 *
 * const App = () => (
 *   <ChatComposite
 *     ...
 *     fileSharing={{
 *       fileDownloadHandler: fileDownloadHandler
 *     }}
 *   />
 * )
 *
 * ```
 * @param userId - The user ID of the user downloading the file.
 * @param fileMetadata - The {@link FileMetadata} containing file `url`, `extension` and `name`.
 */
export type FileDownloadHandler = (userId: string, fileMetadata: FileMetadata) => Promise<URL | FileDownloadError>;
