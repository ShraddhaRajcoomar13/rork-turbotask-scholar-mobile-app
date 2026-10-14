# 📱 TurboTask Scholar — Mobile App

> A mobile worksheet creator + classroom task tracker built with React Native / Expo. Teachers create, assign, and grade worksheets — all offline-first in one clean app.

[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📖 Overview

**TurboTask Scholar** is a cross-platform mobile app built **for teachers** — a lightweight worksheet creator and classroom task tracker that works without internet, without accounts, and without hassle.

Design worksheets on your phone during a coffee break, assign them to classes, collect submissions, and track student progress — all from one place.

---

## ✨ Features

### 📝 Worksheet Creator
- Build worksheets with **multiple question types**:
  - Multiple choice
  - Short answer
  - True / False
  - Fill in the blank
  - Matching
  - Long-form / essay
- Add images, formulas, and instructions per question
- Set point values and auto-grading rules
- Duplicate & edit existing worksheets
- Export to **PDF** or **share as a link**
- Template library for common subjects (Math, Science, English, History)

### 👩‍🏫 Classroom Management
- Create classes and add students manually or via CSV import
- Assign worksheets to one or many classes
- Set due dates and time limits
- Track submission status per student
- Grade with built-in scoring or manually

### 📊 Progress Tracking
- Per-student performance overview
- Class averages & completion rates
- Identify struggling students at a glance
- Export grades to CSV

### 🔔 Notifications & Reminders
- Local push notifications for due dates
- Reminders to grade pending submissions
- Daily digest of upcoming assignments

### 🎨 Experience
- 🌙 Dark mode & light mode
- 📴 Fully offline — all data stays on device
- ⚡ Instant startup, no login required
- 📱 iOS, Android, and Web via Expo

---

## 📸 Screenshots

| Worksheet Editor | Question Types | Class View | Grades |
|------------------|----------------|------------|--------|
| ![Editor](./assets/screenshots/editor.png) | ![Questions](./assets/screenshots/questions.png) | ![Class](./assets/screenshots/class.png) | ![Grades](./assets/screenshots/grades.png) |

> *Replace the paths above with your actual screenshots.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | React Context + Hooks |
| Storage | AsyncStorage / SQLite |
| PDF Export | Expo Print / react-native-pdf-lib |
| Notifications | Expo Notifications |
| Icons | Expo Vector Icons |
| Build tool | Rork (AI app generation) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org))
- **npm** or **yarn**
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/ShraddhaRajcoomar13/rork-turbotask-scholar-mobile-app.git
cd rork-turbotask-scholar-mobile-app

# 2. Install dependencies
npm install
# or
yarn install
```

### Run the App

```bash
npx expo start
```

Then:
- 📱 Scan the QR code with **Expo Go**
- 🖥️ Press `w` to open in the browser
- 🤖 Press `a` for Android emulator
- 🍎 Press `i` for iOS simulator (macOS only)

---

## 📂 Project Structure

```
rork-turbotask-scholar-mobile-app/
├── app/                       # Screens & routing (Expo Router)
│   ├── (tabs)/                # Tab navigation
│   │   ├── index.tsx          # Dashboard
│   │   ├── worksheets.tsx     # Worksheet library
│   │   ├── classes.tsx        # Class management
│   │   └── grades.tsx         # Grade tracking
│   ├── worksheet/
│   │   ├── [id].tsx           # Worksheet detail
│   │   └── new.tsx            # Worksheet builder
│   ├── class/[id].tsx         # Class detail
│   └── _layout.tsx            # Root layout
├── components/                # Reusable UI components
│   ├── QuestionCard.tsx
│   ├── WorksheetCard.tsx
│   └── StudentRow.tsx
├── constants/                 # Colors, themes, config
├── hooks/                     # Custom React hooks
├── lib/                       # Storage & utilities
├── assets/                    # Images, fonts, icons
├── app.json                   # Expo config
├── package.json
└── README.md
```

---

## 🧑‍💻 Usage Examples

### Create a Worksheet

```tsx
import { createWorksheet } from '@/lib/storage';

const worksheet = await createWorksheet({
  title: 'Photosynthesis Quiz',
  subject: 'Biology',
  gradeLevel: '9',
  questions: [
    {
      type: 'multiple_choice',
      prompt: 'What gas do plants absorb during photosynthesis?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      answer: 'Carbon Dioxide',
      points: 2,
    },
    {
      type: 'short_answer',
      prompt: 'Name the pigment that gives plants their green color.',
      answer: 'Chlorophyll',
      points: 1,
    },
  ],
});
```

### Assign to a Class

```tsx
import { assignWorksheet } from '@/lib/storage';

await assignWorksheet({
  worksheetId: worksheet.id,
  classId: 'bio-9a',
  dueDate: new Date('2025-06-15'),
  timeLimitMinutes: 30,
});
```

### Grade a Submission

```tsx
import { gradeSubmission } from '@/lib/storage';

await gradeSubmission({
  submissionId: 'sub-123',
  score: 18,
  feedback: 'Great work! Watch your spelling on question 3.',
});
```

### Export to PDF

```tsx
import * as Print from 'expo-print';

const html = buildWorksheetHTML(worksheet);
const { uri } = await Print.printToFileAsync({ html });
// Share uri via expo-sharing
```

---

## 🗺️ Roadmap

- [x] Offline-first worksheet creation
- [x] Multiple question types
- [x] Class & student management
- [x] Local notifications
- [ ] Cloud sync (Firebase / Supabase) for cross-device access
- [ ] Student app (submit answers on their own device)
- [ ] AI-generated questions from a topic prompt
- [ ] Auto-grading for short answers (semantic matching)
- [ ] Google Classroom / Microsoft Teams integration
- [ ] CSV import for student rosters
- [ ] Printable worksheet templates
- [ ] Tablet-optimized layout

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please open an **issue** first for major changes so we can discuss the approach.

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? [Open an issue](https://github.com/ShraddhaRajcoomar13/rork-turbotask-scholar-mobile-app/issues) with:
- A clear title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if possible

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Expo](https://expo.dev) — the easiest way to build React Native apps
- [Rork](https://rork.com) — AI-powered app generation
- [React Native](https://reactnative.dev) — the framework
- Every teacher who spends their evenings making worksheets 💚

---

## ⭐ Show Your Support

If **TurboTask Scholar** helped you or inspired you:

- ⭐ **Star this repo**
- 🍴 **Fork it**
- 🐦 **Share it** with a teacher who'd love it
- 💬 **Drop feedback** in the issues

---

<div align="center">

**Made with ❤️ for teachers everywhere**

*Less time making worksheets. More time teaching.*

</div>
```

