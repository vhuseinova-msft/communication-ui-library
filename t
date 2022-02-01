[1mdiff --git a/packages/react-composites/src/composites/CallComposite/CallComposite.tsx b/packages/react-composites/src/composites/CallComposite/CallComposite.tsx[m
[1mindex 75ce2e8c2..553502ace 100644[m
[1m--- a/packages/react-composites/src/composites/CallComposite/CallComposite.tsx[m
[1m+++ b/packages/react-composites/src/composites/CallComposite/CallComposite.tsx[m
[36m@@ -89,7 +89,7 @@[m [mconst MainScreen = (props: MainScreenProps): JSX.Element => {[m
         <ConfigurationPage[m
           mobileView={props.mobileView}[m
           startCallHandler={(): void => {[m
[31m-            adapter.joinCall();[m
[32m+[m[32m            adapter.startCall();[m
           }}[m
         />[m
       );[m
[1mdiff --git a/packages/react-composites/src/composites/CallComposite/adapter/AzureCommunicationCallAdapter.ts b/packages/react-composites/src/composites/CallComposite/adapter/AzureCommunicationCallAdapter.ts[m
[1mindex 8d7fddd72..62efecfa8 100644[m
[1m--- a/packages/react-composites/src/composites/CallComposite/adapter/AzureCommunicationCallAdapter.ts[m
[1m+++ b/packages/react-composites/src/composites/CallComposite/adapter/AzureCommunicationCallAdapter.ts[m
[36m@@ -132,6 +132,7 @@[m [mexport class AzureCommunicationCallAdapter implements CallAdapter {[m
   private deviceManager: StatefulDeviceManager;[m
   private localStream: SDKLocalVideoStream | undefined;[m
   private locator: TeamsMeetingLinkLocator | GroupCallLocator;[m
[32m+[m[32m  private outboundTeamsUserMRI: string | undefined;[m
   // Never use directly, even internally. Use `call` property instead.[m
   private _call?: Call;[m
   private context: CallContext;[m
[36m@@ -154,14 +155,19 @@[m [mexport class AzureCommunicationCallAdapter implements CallAdapter {[m
     callClient: StatefulCallClient,[m
     locator: TeamsMeetingLinkLocator | GroupCallLocator,[m
     callAgent: CallAgent,[m
[31m-    deviceManager: StatefulDeviceManager[m
[32m+[m[32m    deviceManager: StatefulDeviceManager,[m
[32m+[m[32m    /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m    outboundTeamsUserMRI?: string[m
   ) {[m
     this.bindPublicMethods();[m
     this.callClient = callClient;[m
     this.callAgent = callAgent;[m
     this.locator = locator;[m
[32m+[m[32m    /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m    this.outboundTeamsUserMRI = outboundTeamsUserMRI;[m
[32m+[m[32m    console.log('setting outboundTeamsUserMRI: ', outboundTeamsUserMRI);[m
     this.deviceManager = deviceManager;[m
[31m-    const isTeamsMeeting = 'meetingLink' in this.locator;[m
[32m+[m[32m    const isTeamsMeeting = Object.keys(this.locator).includes('meetingLink');[m
     this.context = new CallContext(callClient.getState(), isTeamsMeeting);[m
     const onStateChange = (clientState: CallClientState): void => {[m
       // unsubscribe when the instance gets disposed[m
[36m@@ -361,11 +367,19 @@[m [mexport class AzureCommunicationCallAdapter implements CallAdapter {[m
   }[m
 [m
   //TODO: a better way to expose option parameter[m
[31m-  public startCall(participants: string[]): Call | undefined {[m
[32m+[m[32m  // eslint-disable-next-line @typescript-eslint/no-unused-vars[m
[32m+[m[32m  public startCall(participants?: string[]): Call | undefined {[m
[32m+[m[32m    // TODO: for now just have start call dictate if group call or 1:1 adhoc call[m
[32m+[m[32m    if (!this.outboundTeamsUserMRI) {[m
[32m+[m[32m      return this.joinCall();[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    const callParticipants = [this.outboundTeamsUserMRI];[m
[32m+[m
     if (_isInCall(this.getState().call?.state ?? 'None')) {[m
       throw new Error('You are already in the call.');[m
     } else {[m
[31m-      const idsToAdd = participants.map((participant) => {[m
[32m+[m[32m      const idsToAdd = callParticipants.map((participant) => {[m
         // FIXME: `onStartCall` does not allow a Teams user.[m
         // Need some way to return an error if a Teams user is provided.[m
         const backendId = fromFlatCommunicationIdentifier(participant) as CommunicationUserIdentifier;[m
[36m@@ -537,6 +551,10 @@[m [mexport type AzureCommunicationCallAdapterArgs = {[m
   displayName: string;[m
   credential: CommunicationTokenCredential;[m
   locator: TeamsMeetingLinkLocator | GroupCallLocator;[m
[32m+[m
[32m+[m[32m  /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m  /** This should be combined into `callLocator` once it is moved out of beta compile */[m
[32m+[m[32m  outboundTeamsUserMRI?: string;[m
 };[m
 [m
 /**[m
[36m@@ -552,11 +570,18 @@[m [mexport const createAzureCommunicationCallAdapter = async ({[m
   userId,[m
   displayName,[m
   credential,[m
[31m-  locator[m
[32m+[m[32m  locator,[m
[32m+[m[32m  /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m  outboundTeamsUserMRI[m
 }: AzureCommunicationCallAdapterArgs): Promise<CallAdapter> => {[m
   const callClient = createStatefulCallClient({ userId });[m
   const callAgent = await callClient.createCallAgent(credential, { displayName });[m
[31m-  const adapter = createAzureCommunicationCallAdapterFromClient(callClient, callAgent, locator);[m
[32m+[m[32m  const adapter = createAzureCommunicationCallAdapterFromClient([m
[32m+[m[32m    callClient,[m
[32m+[m[32m    callAgent,[m
[32m+[m[32m    locator,[m
[32m+[m[32m    /* @conditional-compile-remove-from(stable) TeamsAdhocCall */ outboundTeamsUserMRI[m
[32m+[m[32m  );[m
   return adapter;[m
 };[m
 [m
[36m@@ -571,10 +596,18 @@[m [mexport const createAzureCommunicationCallAdapter = async ({[m
 export const createAzureCommunicationCallAdapterFromClient = async ([m
   callClient: StatefulCallClient,[m
   callAgent: CallAgent,[m
[31m-  locator: TeamsMeetingLinkLocator | GroupCallLocator[m
[32m+[m[32m  locator: TeamsMeetingLinkLocator | GroupCallLocator,[m
[32m+[m[32m  /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m  outboundTeamsUserMRI?: string[m
 ): Promise<CallAdapter> => {[m
   const deviceManager = (await callClient.getDeviceManager()) as StatefulDeviceManager;[m
[31m-  return new AzureCommunicationCallAdapter(callClient, locator, callAgent, deviceManager);[m
[32m+[m[32m  return new AzureCommunicationCallAdapter([m
[32m+[m[32m    callClient,[m
[32m+[m[32m    locator,[m
[32m+[m[32m    callAgent,[m
[32m+[m[32m    deviceManager,[m
[32m+[m[32m    /* @conditional-compile-remove-from(stable) TeamsAdhocCall */ outboundTeamsUserMRI[m
[32m+[m[32m  );[m
 };[m
 [m
 const isCallError = (e: Error): e is CallError => {[m
[1mdiff --git a/packages/react-composites/src/composites/CallComposite/adapter/CallAdapter.ts b/packages/react-composites/src/composites/CallComposite/adapter/CallAdapter.ts[m
[1mindex f8f0fce97..f1ec3cc9e 100644[m
[1m--- a/packages/react-composites/src/composites/CallComposite/adapter/CallAdapter.ts[m
[1m+++ b/packages/react-composites/src/composites/CallComposite/adapter/CallAdapter.ts[m
[36m@@ -211,7 +211,7 @@[m [mexport interface CallAdapterCallManagement {[m
    *[m
    * @public[m
    */[m
[31m-  startCall(participants: string[]): Call | undefined;[m
[32m+[m[32m  startCall(participants?: string[]): Call | undefined;[m
   /**[m
    * Start sharing the screen during a call.[m
    *[m
[1mdiff --git a/packages/react-composites/src/composites/MeetingComposite/adapter/AzureCommunicationMeetingAdapter.ts b/packages/react-composites/src/composites/MeetingComposite/adapter/AzureCommunicationMeetingAdapter.ts[m
[1mindex 4c3de1e23..1e3dc8697 100644[m
[1m--- a/packages/react-composites/src/composites/MeetingComposite/adapter/AzureCommunicationMeetingAdapter.ts[m
[1m+++ b/packages/react-composites/src/composites/MeetingComposite/adapter/AzureCommunicationMeetingAdapter.ts[m
[36m@@ -399,6 +399,10 @@[m [mexport type AzureCommunicationMeetingAdapterArgs = {[m
   credential: CommunicationTokenCredential;[m
   chatThreadId: string;[m
   callLocator: TeamsMeetingLinkLocator | GroupCallLocator;[m
[32m+[m
[32m+[m[32m  /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m  /** This should be combined into `callLocator` once it is moved out of beta compile */[m
[32m+[m[32m  outboundTeamsUserMRI?: string;[m
 };[m
 [m
 /**[m
[36m@@ -413,15 +417,21 @@[m [mexport const createAzureCommunicationMeetingAdapter = async ({[m
   credential,[m
   endpoint,[m
   chatThreadId,[m
[31m-  callLocator[m
[32m+[m[32m  callLocator,[m
[32m+[m[32m  /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m  outboundTeamsUserMRI[m
 }: AzureCommunicationMeetingAdapterArgs): Promise<MeetingAdapter> => {[m
[32m+[m[32m  console.log('creating call adapter');[m
   const callAdapter = await createAzureCommunicationCallAdapter({[m
     userId,[m
     displayName,[m
     credential,[m
[31m-    locator: callLocator[m
[32m+[m[32m    locator: callLocator,[m
[32m+[m[32m    /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m    outboundTeamsUserMRI[m
   });[m
 [m
[32m+[m[32m  console.log('creating chat adapter');[m
   const chatAdapter = await createAzureCommunicationChatAdapter({[m
     endpoint,[m
     userId,[m
[36m@@ -430,5 +440,6 @@[m [mexport const createAzureCommunicationMeetingAdapter = async ({[m
     threadId: chatThreadId[m
   });[m
 [m
[32m+[m[32m  console.log('creating meeting adapter');[m
   return new AzureCommunicationMeetingAdapter(callAdapter, chatAdapter);[m
 };[m
[1mdiff --git a/packages/react-composites/src/composites/localization/locales/en-US/strings.json b/packages/react-composites/src/composites/localization/locales/en-US/strings.json[m
[1mindex 68e35f355..cb48807a5 100644[m
[1m--- a/packages/react-composites/src/composites/localization/locales/en-US/strings.json[m
[1m+++ b/packages/react-composites/src/composites/localization/locales/en-US/strings.json[m
[36m@@ -25,7 +25,7 @@[m
     "learnMore": "Learn more",[m
     "leftCallMoreDetails": "If this was a mistake, re-join the call.",[m
     "leftCallTitle": "You left the call",[m
[31m-    "lobbyScreenConnectingToCallTitle": "Joining call",[m
[32m+[m[32m    "lobbyScreenConnectingToCallTitle": "Connecting to call",[m
     "lobbyScreenWaitingToBeAdmittedTitle": "Waiting to be admitted",[m
     "microphonePermissionDenied": "Your browser is blocking access to your microphone",[m
     "mutedMessage": "You're muted",[m
[1mdiff --git a/samples/Meeting/src/app/App.tsx b/samples/Meeting/src/app/App.tsx[m
[1mindex c0e7ae7c7..bddb5e78a 100644[m
[1m--- a/samples/Meeting/src/app/App.tsx[m
[1m+++ b/samples/Meeting/src/app/App.tsx[m
[36m@@ -16,13 +16,14 @@[m [mimport {[m
   getTeamsLinkFromUrl,[m
   isOnIphoneAndNotSafari[m
 } from './utils/AppUtils';[m
[31m-import { MeetingScreen } from './views/MeetingScreen';[m
[32m+[m[32mimport { MeetingScreen, TeamsUserMRI } from './views/MeetingScreen';[m
 import { HomeScreen } from './views/HomeScreen';[m
 import { UnsupportedBrowserPage } from './views/UnsupportedBrowserPage';[m
 import { getEndpointUrl } from './utils/getEndpointUrl';[m
 import { joinThread } from './utils/joinThread';[m
 import { getThread } from './utils/getThread';[m
 import { pushQSPUrl } from './utils/pushQSPUrl';[m
[32m+[m[32mimport { LocalStorageKeys } from './utils/localStorage';[m
 [m
 const ALERT_TEXT_TRY_AGAIN = "You can't be added at this moment. Please wait at least 60 seconds to try again.";[m
 [m
[36m@@ -32,7 +33,7 @@[m [minterface Credentials {[m
 }[m
 [m
 interface CallArgs {[m
[31m-  callLocator: GroupLocator | TeamsMeetingLinkLocator;[m
[32m+[m[32m  callLocator: GroupLocator | TeamsMeetingLinkLocator | TeamsUserMRI;[m
   displayName: string;[m
 }[m
 [m
[36m@@ -83,7 +84,7 @@[m [mconst App = (): JSX.Element => {[m
             return;[m
           }[m
           setThreadId(newThreadId);[m
[31m-          pushQSPUrl({ name: 'threadId', value: newThreadId });[m
[32m+[m[32m          // pushQSPUrl({ name: 'threadId', value: newThreadId }); TODO: suppressed for dev work, reapply when complete.[m
         }[m
         setEndpointUrl(await getEndpointUrl());[m
       }[m
[36m@@ -102,6 +103,18 @@[m [mconst App = (): JSX.Element => {[m
       return ([m
         <HomeScreen[m
           joiningExistingCall={joiningExistingMeeting}[m
[32m+[m[32m          startTeamsAdhocCall={(callDetails) => {[m
[32m+[m[32m            // For ease of use, add 8:orgid: if the MRI was not prefixed already (allows pasting just an MRI without the prefix)[m
[32m+[m[32m            window.localStorage.setItem(LocalStorageKeys.AdhocTeamsUserMRI, callDetails.mri);[m
[32m+[m[32m            const teamsUserMRI = callDetails.mri.startsWith('8:orgid:')[m
[32m+[m[32m              ? callDetails.mri[m
[32m+[m[32m              : '8:orgid:' + callDetails.mri;[m
[32m+[m[32m            setCallArgs({[m
[32m+[m[32m              displayName: callDetails.displayName,[m
[32m+[m[32m              callLocator: teamsUserMRI[m
[32m+[m[32m            });[m
[32m+[m[32m            setPage('meeting');[m
[32m+[m[32m          }}[m
           startMeetingHandler={(callDetails) => {[m
             const isTeamsMeeting = !!callDetails.teamsLink;[m
             const localCallArgs = {[m
[1mdiff --git a/samples/Meeting/src/app/utils/localStorage.ts b/samples/Meeting/src/app/utils/localStorage.ts[m
[1mindex c31e57f0f..735612cec 100644[m
[1m--- a/samples/Meeting/src/app/utils/localStorage.ts[m
[1m+++ b/samples/Meeting/src/app/utils/localStorage.ts[m
[36m@@ -5,7 +5,8 @@[m [mexport const localStorageAvailable = typeof Storage !== 'undefined';[m
 [m
 export enum LocalStorageKeys {[m
   DisplayName = 'DisplayName',[m
[31m-  Theme = 'AzureCommunicationUI_Theme'[m
[32m+[m[32m  Theme = 'AzureCommunicationUI_Theme',[m
[32m+[m[32m  AdhocTeamsUserMRI = 'AdhocTeamsUserMRI' // TODO: Remove, just added for quicker development[m
 }[m
 [m
 /**[m
[1mdiff --git a/samples/Meeting/src/app/views/HomeScreen.tsx b/samples/Meeting/src/app/views/HomeScreen.tsx[m
[1mindex 04d9d13a6..5bdae0136 100644[m
[1m--- a/samples/Meeting/src/app/views/HomeScreen.tsx[m
[1m+++ b/samples/Meeting/src/app/views/HomeScreen.tsx[m
[36m@@ -2,7 +2,7 @@[m
 // Licensed under the MIT license.[m
 [m
 import React, { useState } from 'react';[m
[31m-import { Stack, PrimaryButton, Image, ChoiceGroup, IChoiceGroupOption, Text, TextField } from '@fluentui/react';[m
[32m+[m[32mimport { Stack, PrimaryButton, Image, ChoiceGroup, IChoiceGroupOption, Text, TextField, Link } from '@fluentui/react';[m
 import heroSVG from '../../assets/hero.svg';[m
 import {[m
   imgStyle,[m
[36m@@ -18,36 +18,50 @@[m [mimport {[m
   buttonStyle[m
 } from '../styles/HomeScreen.styles';[m
 import { ThemeSelector } from '../theming/ThemeSelector';[m
[31m-import { localStorageAvailable } from '../utils/localStorage';[m
[32m+[m[32mimport { localStorageAvailable, LocalStorageKeys } from '../utils/localStorage';[m
 import { getDisplayNameFromLocalStorage, saveDisplayNameToLocalStorage } from '../utils/localStorage';[m
 import { DisplayNameField } from './DisplayNameField';[m
 import { TeamsMeetingLinkLocator } from '@azure/communication-calling';[m
 [m
 export interface HomeScreenProps {[m
[31m-  startMeetingHandler(callDetails: { displayName: string; teamsLink?: TeamsMeetingLinkLocator }): void;[m
[32m+[m[32m  startMeetingHandler: (callDetails: { displayName: string; teamsLink?: TeamsMeetingLinkLocator }) => void;[m
[32m+[m[32m  startTeamsAdhocCall: (callDetails: { displayName: string; mri: string }) => void;[m
   joiningExistingCall: boolean;[m
 }[m
 [m
[32m+[m[32mtype MeetingType = 'ACSMeeting' | 'TeamsMeeting' | 'TeamsAdhocCall';[m
[32m+[m[32mtype MeetingRadialOptions = IChoiceGroupOption & {[m
[32m+[m[32m  key: MeetingType;[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mconst callOptions: MeetingRadialOptions[] = [[m
[32m+[m[32m  { key: 'ACSMeeting', text: 'Start a ACS Meeting' },[m
[32m+[m[32m  { key: 'TeamsMeeting', text: 'Join a Teams meeting' },[m
[32m+[m[32m  { key: 'TeamsAdhocCall', text: 'Call a Teams user' }[m
[32m+[m[32m];[m
[32m+[m
[32m+[m[32mconst callOptionsGroupLabel = 'Select a Meeting option';[m
[32m+[m[32mconst buttonText = 'Next';[m
[32m+[m
 export const HomeScreen = (props: HomeScreenProps): JSX.Element => {[m
[31m-  const { startMeetingHandler } = props;[m
[32m+[m[32m  const { startMeetingHandler, startTeamsAdhocCall } = props;[m
   const imageProps = { src: heroSVG.toString() };[m
   const headerTitle = props.joiningExistingCall ? 'Join Meeting' : 'Start or join a Meeting';[m
[31m-  const callOptionsGroupLabel = 'Select a Meeting option';[m
[31m-  const buttonText = 'Next';[m
[31m-  const callOptions: IChoiceGroupOption[] = [[m
[31m-    { key: 'ACSMeeting', text: 'Start a ACS Meeting' },[m
[31m-    { key: 'TeamsMeeting', text: 'Join a Teams meeting' }[m
[31m-  ];[m
 [m
   // Get display name from local storage if available[m
   const defaultDisplayName = localStorageAvailable ? getDisplayNameFromLocalStorage() : null;[m
   const [displayName, setDisplayName] = useState<string | undefined>(defaultDisplayName ?? undefined);[m
 [m
[31m-  const [chosenCallOption, setChosenCallOption] = useState<IChoiceGroupOption>(callOptions[0]);[m
[32m+[m[32m  const [chosenCallOption, setChosenCallOption] = useState<MeetingRadialOptions>(callOptions[0]);[m
   const [teamsLink, setTeamsLink] = useState<TeamsMeetingLinkLocator>();[m
 [m
[31m-  const teamsCallChosen: boolean = chosenCallOption.key === 'TeamsMeeting';[m
[31m-  const buttonEnabled = displayName && (!teamsCallChosen || teamsLink);[m
[32m+[m[32m  const teamsMRIDefaultValue = window.localStorage.getItem(LocalStorageKeys.AdhocTeamsUserMRI) ?? undefined;[m
[32m+[m[32m  const [teamsUserMRI, setTeamsUserMRI] = useState<string | undefined>(teamsMRIDefaultValue);[m
[32m+[m
[32m+[m[32m  const buttonEnabled =[m
[32m+[m[32m    displayName &&[m
[32m+[m[32m    (chosenCallOption.key !== 'TeamsMeeting' || teamsLink) &&[m
[32m+[m[32m    (chosenCallOption.key !== 'TeamsAdhocCall' || teamsUserMRI);[m
 [m
   return ([m
     <Stack[m
[36m@@ -72,17 +86,42 @@[m [mexport const HomeScreen = (props: HomeScreenProps): JSX.Element => {[m
                 defaultSelectedKey="ACSMeeting"[m
                 options={callOptions}[m
                 required={true}[m
[31m-                onChange={(_, option) => option && setChosenCallOption(option)}[m
[32m+[m[32m                onChange={(_, option) => option && setChosenCallOption(option as MeetingRadialOptions)}[m
               />[m
             )}[m
[31m-            {teamsCallChosen && ([m
[32m+[m[32m            {chosenCallOption.key === 'TeamsMeeting' && ([m
               <TextField[m
[32m+[m[32m                required[m
                 className={teamsItemStyle}[m
                 iconProps={{ iconName: 'Link' }}[m
                 placeholder={'Enter a Teams meeting link'}[m
[31m-                onChange={(_, newValue) => newValue && setTeamsLink({ meetingLink: newValue })}[m
[32m+[m[32m                onChange={(_, newValue) => setTeamsLink(newValue ? { meetingLink: newValue } : undefined)}[m
               />[m
             )}[m
[32m+[m[32m            {chosenCallOption.key === 'TeamsAdhocCall' && ([m
[32m+[m[32m              <>[m
[32m+[m[32m                <Text>[m
[32m+[m[32m                  <b>[m
[32m+[m[32m                    This feature is currently in{' '}[m
[32m+[m[32m                    <Link[m
[32m+[m[32m                      href="https://docs.microsoft.com/en-us/azure/communication-services/concepts/interop/calling-chat"[m
[32m+[m[32m                      target="_blank"[m
[32m+[m[32m                    >[m
[32m+[m[32m                      private preview[m
[32m+[m[32m                    </Link>[m
[32m+[m[32m                    .[m
[32m+[m[32m                  </b>[m
[32m+[m[32m                </Text>[m
[32m+[m[32m                <TextField[m
[32m+[m[32m                  required[m
[32m+[m[32m                  defaultValue={teamsMRIDefaultValue}[m
[32m+[m[32m                  className={teamsItemStyle}[m
[32m+[m[32m                  iconProps={{ iconName: 'Contact' }}[m
[32m+[m[32m                  placeholder={'Enter a Teams user MRI'}[m
[32m+[m[32m                  onChange={(_, newValue) => setTeamsUserMRI(newValue)}[m
[32m+[m[32m                />[m
[32m+[m[32m              </>[m
[32m+[m[32m            )}[m
           </Stack>[m
           <DisplayNameField defaultName={displayName} setName={setDisplayName} />[m
 [m
[36m@@ -93,7 +132,11 @@[m [mexport const HomeScreen = (props: HomeScreenProps): JSX.Element => {[m
             onClick={() => {[m
               if (displayName) {[m
                 saveDisplayNameToLocalStorage(displayName);[m
[31m-                startMeetingHandler({ displayName, teamsLink });[m
[32m+[m[32m                if (chosenCallOption.key === 'TeamsMeeting' || chosenCallOption.key === 'ACSMeeting') {[m
[32m+[m[32m                  startMeetingHandler({ displayName, teamsLink });[m
[32m+[m[32m                } else if (chosenCallOption.key === 'TeamsAdhocCall') {[m
[32m+[m[32m                  teamsUserMRI && startTeamsAdhocCall({ displayName, mri: teamsUserMRI });[m
[32m+[m[32m                }[m
               }[m
             }}[m
           />[m
[1mdiff --git a/samples/Meeting/src/app/views/MeetingScreen.tsx b/samples/Meeting/src/app/views/MeetingScreen.tsx[m
[1mindex 987bde366..706a7a313 100644[m
[1m--- a/samples/Meeting/src/app/views/MeetingScreen.tsx[m
[1m+++ b/samples/Meeting/src/app/views/MeetingScreen.tsx[m
[36m@@ -14,10 +14,13 @@[m [mimport { MeetingAdapter } from '@internal/react-composites';[m
 [m
 const detectMobileSession = (): boolean => !!new MobileDetect(window.navigator.userAgent).mobile();[m
 [m
[32m+[m[32m/** MRI of a teams user, this should start with '8:orgid:' */[m
[32m+[m[32mexport type TeamsUserMRI = string;[m
[32m+[m
 export interface MeetingScreenProps {[m
   token: string;[m
   userId: CommunicationUserIdentifier;[m
[31m-  callLocator: GroupCallLocator | TeamsMeetingLinkLocator;[m
[32m+[m[32m  callLocator: GroupCallLocator | TeamsMeetingLinkLocator | TeamsUserMRI;[m
   displayName: string;[m
   webAppTitle: string;[m
   endpoint: string;[m
[36m@@ -41,14 +44,16 @@[m [mexport const MeetingScreen = (props: MeetingScreenProps): JSX.Element => {[m
 [m
   useEffect(() => {[m
     (async () => {[m
[31m-      if (!userId || !displayName || !callLocator || !threadId || !token || !endpoint) {[m
[32m+[m[32m      if (!userId || !displayName || !callLocator || !token || !endpoint) {[m
         return;[m
       }[m
       const adapter = await createAzureCommunicationMeetingAdapter({[m
         userId,[m
         displayName,[m
         credential: createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), token),[m
[31m-        callLocator: callLocator,[m
[32m+[m[32m        callLocator: callLocator as GroupCallLocator,[m
[32m+[m[32m        /* @conditional-compile-remove-from(stable) TeamsAdhocCall */[m
[32m+[m[32m        outboundTeamsUserMRI: typeof callLocator === 'string' ? callLocator : undefined,[m
         endpoint,[m
         chatThreadId: threadId[m
       });[m
[1mdiff --git a/samples/Server/appsettings.json b/samples/Server/appsettings.json[m
[1mindex ba2b1b5d6..b8cce5d02 100644[m
[1m--- a/samples/Server/appsettings.json[m
[1m+++ b/samples/Server/appsettings.json[m
[36m@@ -7,6 +7,6 @@[m
     }[m
   },[m
   "AllowedHosts": "*",[m
[31m-  "ResourceConnectionString": "REPLACE_WITH_CONNECTION_STRING",[m
[31m-  "EndpointUrl":"REPLACE_WITH_ENDPOINT_URL"[m
[32m+[m[32m  "ResourceConnectionString": "endpoint=https://web-ui-dev.communication.azure.com/;accesskey=9OHavAQQzvErQ7VRLu7PfUh8aLH51B0O6UNienOIVyHR34veqy52bMIYKT7JZgV2fI81QLJ0YlTKF5E0T/Wr8Q==",[m
[32m+[m[32m  "EndpointUrl":"https://web-ui-dev.communication.azure.com/"[m
 }[m
