# 🎙️ Podcast Studio Mobile

A powerful, offline-first mobile application that transforms smartphones into professional podcast recording studios. The app provides automated setup templates, high-quality audio recording, basic editing capabilities, and intelligent audio enhancement—all without requiring an internet connection.

## 📱 Overview

**Podcast Studio Mobile** is a React Native application built with Expo that empowers freelance podcast creators to:

- 🎯 Record professional-quality podcasts anywhere, anytime
- 🤖 Use automated templates to eliminate technical complexity
- 🎚️ Apply professional audio enhancement automatically
- 📴 Work 100% offline - no internet required
- 🚀 Export and share with one tap

## 🚀 Features

### MVP Features (Phase 1 - Local-First)

1. **Automated Podcast Templates**
   - Pre-configured recording setups (Solo, Interview, Multi-Host, Narrative)
   - Custom audio quality settings per template
   - Template customization and saving

2. **Professional Audio Recording**
   - High-quality audio capture (up to 48kHz)
   - Real-time audio level monitoring
   - Recording timer and pause/resume
   - Background recording support

3. **Basic Audio Editing**
   - Trim start/end
   - Cut segments
   - Basic volume adjustment
   - Fade in/out

4. **Audio Enhancement (Automated)**
   - Noise reduction
   - Audio normalization
   - Dynamic compression
   - EQ presets (Voice optimization, Bass boost, etc.)

5. **Project Management**
   - Save recordings as projects
   - Add episode metadata (title, description, tags)
   - Organize episodes by podcast series

6. **Export & Share**
   - Export to MP3/WAV/M4A
   - Multiple quality presets
   - Share via native share sheet
   - Save to device storage

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (managed workflow)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **Audio Recording**: expo-av
- **Audio Processing**: expo-av + FFmpeg (planned)
- **Local Storage**: AsyncStorage (settings) + expo-file-system (audio files)
- **UI Components**: Custom components with React Native Paper
- **Testing**: Jest, React Native Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Physical device for testing audio features (recommended)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/podcast-studio-mobile.git
cd podcast-studio-mobile
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
```bash
# iOS
npm run ios

# Android
npm run android

# Or scan the QR code with Expo Go app
```

## 📁 Project Structure

```
podcast-studio-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── TemplatesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # Business logic services
│   ├── store/               # Redux store and slices
│   │   ├── audioSlice.ts    # Recording/playback state
│   │   ├── projectsSlice.ts # Projects and episodes
│   │   ├── templatesSlice.ts # Podcast templates
│   │   ├── settingsSlice.ts # App settings
│   │   └── index.ts         # Store configuration
│   ├── theme/               # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── assets/                  # Images, icons, fonts
├── docs/                    # Documentation
├── App.tsx                  # App entry point
├── app.json                 # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Architecture

### State Management

The app uses Redux Toolkit with the following slices:

1. **audioSlice** - Recording state, playback state, audio levels
2. **projectsSlice** - All podcast projects and episodes
3. **templatesSlice** - Podcast setup templates
4. **settingsSlice** - App settings and preferences

### Local Storage Strategy

**AsyncStorage** (Settings & Metadata):
- User preferences
- App settings
- Project metadata
- Template configurations

**expo-file-system** (Audio Files):
- Raw recordings: `${FileSystem.documentDirectory}/recordings/`
- Processed audio: `${FileSystem.documentDirectory}/exports/`
- Project files: `${FileSystem.documentDirectory}/projects/`

## 🧪 Testing

Run tests:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

Type checking:
```bash
npm run type-check
```

## 📱 Development Roadmap

- [x] Phase 0: Planning & Design
- [x] Phase 1: Project Setup (Foundation)
- [ ] Phase 2: Base Component Library
- [ ] Phase 3: Template System
- [ ] Phase 4: Audio Recording Core
- [ ] Phase 5: Audio Playback
- [ ] Phase 6: Project Management
- [ ] Phase 7: Basic Audio Editing
- [ ] Phase 8: Audio Enhancement
- [ ] Phase 9: Export & Share
- [ ] Phase 10: Home Dashboard
- [ ] Phase 11: Settings & Preferences
- [ ] Phase 12: Polish & Optimization
- [ ] Phase 13: Testing & QA
- [ ] Phase 14: Build & Deployment

## 🤝 Contributing

This project is in active development. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- All podcast creators who inspired this project

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for podcast creators**
