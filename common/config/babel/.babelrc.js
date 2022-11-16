const plugins = [];
process.env['COMMUNICATION_REACT_FLAVOR'] === 'stable' &&
  plugins.push([
    '../../common/scripts/babel-conditional-preprocess',
    {
      // A list of features recognized by the conditional compilation preprocessing plugin.
      // "demo" is a special feature, used for demo purposes. For this feature,
      // The plugin removes any AST node that is preceded by a comment that contains the tag:
      // @conditional-compile-remove(demo)
      features: [
        'call-readiness',
        // Flag to add API only available in beta calling SDK to mocks and internal types.
        // This feature should be stabilized whenever calling SDK is stabilized.
        'calling-beta-sdk',
        // Participant pane in the `ChatComposite`.
        'chat-composite-participant-pane',
        // API for injecting custom buttons in he control bar for
        // `CallComposite` and `CallWithChatComposite`.
        'control-bar-button-injection',
        // props to allow Contoso to overwrite timestamp format for chat messages, one in locale and one in message thread component
        'date-time-customization',
        // Demo feature. Used in live-documentation of conditional compilation.
        // Do not use in production code.
        'demo',
        // dialpad
        'dialpad',
        // Ability to upload/download files in message thread.
        'file-sharing',
        // 1 to N Calling feature.
        'one-to-n-calling',
        // PSTN calls 
        'PSTN-calls',
        // rooms
        'rooms',
        // Adhoc calls to a Teams user.
        'teams-adhoc-call',
        // Joining calls using teams token
        'teams-identity-support',
        'unsupported-browser',
        // Support Calling SDK isReceiving flag, shows a loading spinner on the video tile when isAvailable is true but isReceiving is false
        'video-stream-is-receiving-flag',
        // Pinned Participants
        'pinned-participants'
      ],
      // A list of stabilized features.
      // These features can be listed in the conditional compilation directives without
      // causing a build failure, but they are ignored by the preprocessing step.
      stabilizedFeatures: [
        // Demo feature. Used in live-documentation of conditional compilation.
        // Do not use in production code.
        'stabilizedDemo',
      ]
    }
  ]);

plugins.push([
  '@babel/plugin-syntax-typescript',
  {
    isTSX: true
  }
]);

module.exports = { plugins };
