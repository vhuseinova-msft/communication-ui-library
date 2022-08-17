// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { buildUrlWithMockAdapter, defaultMockCallAdapterState, defaultMockRemoteParticipant, test } from './fixture';
import { expect } from '@playwright/test';
import { dataUiId, pageClick, stableScreenshot, waitForSelector } from '../../common/utils';
import { IDS } from '../../common/constants';

test.describe('Rooms DeviceButton tests for different roles', async () => {
  test.only('All devices are shown for Presenter', async ({ page, serverUrl }) => {
    const initialState = defaultMockCallAdapterState();
    await page.goto(buildUrlWithMockAdapter(serverUrl, initialState, { role: 'Presenter' }));
    await waitForSelector(page, dataUiId(IDS.videoGallery));
    await waitForSelector(page, dataUiId(IDS.deviceButton));
    await pageClick(page, dataUiId(IDS.deviceButton));
    expect(await stableScreenshot(page, { dismissTooltips: true })).toMatchSnapshot(
      'rooms-call-screen-devices-presenter.png'
    );
  });

  test.only('All devices are shown for Attendee', async ({ page, serverUrl }) => {
    const initialState = defaultMockCallAdapterState();
    await page.goto(buildUrlWithMockAdapter(serverUrl, initialState, { role: 'Attendee' }));
    await waitForSelector(page, dataUiId(IDS.videoGallery));
    await waitForSelector(page, dataUiId(IDS.deviceButton));
    await pageClick(page, dataUiId(IDS.deviceButton));
    expect(await stableScreenshot(page, { dismissTooltips: true })).toMatchSnapshot(
      'rooms-call-screen-devices-Attendee.png'
    );
  });

  test.only('Only speakers are shown for Consumer', async ({ page, serverUrl }) => {
    const paul = defaultMockRemoteParticipant('Paul Bridges');
    const vasily = defaultMockRemoteParticipant('Vasily Podkolzin');
    const participants = [paul, vasily];
    const initialState = defaultMockCallAdapterState(participants);
    await page.goto(buildUrlWithMockAdapter(serverUrl, initialState, { role: 'Consumer' }));
    await waitForSelector(page, dataUiId(IDS.videoGallery));
    await waitForSelector(page, dataUiId(IDS.deviceButton));
    await pageClick(page, dataUiId(IDS.deviceButton));
    expect(await stableScreenshot(page, { dismissTooltips: true })).toMatchSnapshot(
      'rooms-call-screen-devices-Consumer.png'
    );
  });
});
