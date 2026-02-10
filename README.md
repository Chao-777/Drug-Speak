# Drug-Speak 💊🗣️

**A mobile learning platform helping pharmacy students master pharmaceutical pronunciation through AI-powered assessment and interactive practice.**

[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-yellow.svg)](https://github.com/Chao-777/Drug-Speak)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

## 📋 Project Overview

Drug-Speak is a full-stack mobile application I developed to address a critical gap in pharmacy education: the lack of tools for practicing pharmaceutical drug pronunciation. Mispronouncing drug names can lead to serious medication errors, making this skill essential for pharmacy professionals.

**Problem Solved**: Pharmacy students had no effective way to practice and receive feedback on drug name pronunciation outside of class.

**Solution**: An interactive mobile app featuring professional audio pronunciations, real-time recording capabilities, and an intelligent scoring algorithm that provides instant feedback.

**Impact**: Students can practice anytime, track their progress, and compete with peers, creating an engaging learning experience that improves retention and confidence.

## 🎯 Key Achievements

- **Full-Stack Development**: Built end-to-end mobile application with custom backend integration
- **Algorithm Design**: Developed proprietary pronunciation scoring algorithm (0-100 scale) that compares audio waveforms and phonetic patterns
- **Audio Processing**: Implemented a variable-speed playback system supporting multiple audio formats and real-time recording
- **User Authentication**: Designed a secure authentication flow with progress persistence
- **Scalable Architecture**: RESTful API design supporting concurrent users with a ranking system
- **Data-Driven Features**: Built an analytics dashboard tracking user performance metrics and learning progression

## ✨ Key Features

### 🗂️ Organised Drug Library
- Comprehensive categorised collection of pharmaceutical drugs
- Detailed information for each drug, including:
  - Drug name and pronunciation
  - Descriptions and usage information
  - Molecular formulas
- Systematic organisation for efficient learning and quick reference

### 🎧 Multi-Speaker Audio System
- High-quality pronunciation audio from both male and female instructors
- Variable playback speed controls for detailed learning
- Professional pharmaceutical pronunciation standards
- Ability to hear pronunciations at different speeds to catch subtle nuances

### 🎤 Interactive Practice & Assessment
- Built-in voice recording functionality for practice attempts
- Real-time pronunciation evaluation system
- Intelligent scoring algorithm that compares student recordings to instructor standards
- Scoring system ranges from 0-100 for precise feedback
- Track improvement over time

### 👥 Social Learning Features
- Secure user authentication system (sign-up/sign-in)
- Backend integration with dedicated Drug-Speak Server
- Student ranking system based on pronunciation accuracy
- Learning progress tracking and analytics
- Compete with peers to improve motivation

## 🛠️ Technical Stack

### Frontend
- **Platform**: Mobile application (JavaScript-based)
- **UI/UX**: Intuitive interface designed for seamless learning
- **Audio Processing**: Multi-format audio handling with variable speed controls

### Backend
- **Architecture**: RESTful API communication
- **Server**: Custom Drug-Speak Server (course-provided)
- **Authentication**: Secure user management system
- **Data Management**: Progress tracking and user analytics

### Core Technologies
- **Language**: JavaScript (100%)
- **Audio Processing**: Variable speed playback and recording
- **Scoring Algorithm**: Custom pronunciation evaluation system
- **API Integration**: RESTful communication with backend services

## 🧩 Technical Highlights & Challenges Solved

### 1. Audio Comparison Algorithm
**Challenge**: How to objectively score user pronunciation against professional recordings.

**Solution**: Developed a multi-factor scoring algorithm that:
- Extracts audio features (pitch, tempo, phonetic patterns)
- Normalises for speed variations and background noise
- Compares against baseline instructor recordings using similarity metrics
- Returns quantitative scores (0-100) with detailed feedback

**Technologies**: Audio processing libraries, waveform analysis, pattern matching algorithms

### 2. Variable Speed Playback
**Challenge**: Students need to hear pronunciations at different speeds to learn effectively.

**Solution**: Implemented a dynamic audio playback system that:
- Adjusts speed from 0.5x to 2x without pitch distortion
- Maintains audio quality across speed ranges
- Synchronises UI controls with playback state

### 3. Real-Time Recording & Processing
**Challenge**: Capture high-quality audio on various mobile devices with different microphones.

**Solution**: 
- Implemented device-agnostic recording with automatic quality adjustment
- Built noise reduction preprocessing pipeline
- Optimised file compression for efficient server transmission

### 4. Competitive Ranking System
**Challenge**: Create engaging social features that motivate continuous learning.

**Solution**: 
- Designed database schema for efficient ranking queries
- Implemented real-time leaderboard updates
- Built progress tracking with historical data visualisation

### 5. State Management
**Challenge**: Managing complex application state (user data, audio playback, recordings, scores).

**Solution**:
- Implemented centralised state management pattern
- Ensured data persistence across sessions
- Optimised for offline capability where possible

## 💡 Design Decisions

**Mobile-First Approach**: Chose mobile platform because students need on-the-go access during study sessions and clinical rotations.

**Dual-Speaker System**: Included both male and female instructor voices to expose students to natural pronunciation variations.

**Gamification**: Added competitive rankings to increase engagement and create accountability among peers.

**RESTful API**: Designed a stateless API for scalability and easier future expansion to a web platform.

**Modular Architecture**: Separated concerns (UI, business logic, data layer) for maintainability and testing.

## 📚 What I Learned

### Technical Skills
- **Audio Processing**: Deep dive into audio manipulation, format conversion, and waveform analysis
- **Algorithm Development**: Designing scoring systems with accuracy and fairness considerations
- **Mobile Development**: Platform-specific considerations for performance and UX
- **API Design**: Building scalable RESTful services with proper authentication
- **State Management**: Handling complex application state in a mobile environment

### Soft Skills
- **User-Centred Design**: Conducted informal user testing with pharmacy students to refine features
- **Problem Decomposition**: Breaking down "pronunciation assessment" into measurable technical components
- **Performance Optimisation**: Balancing audio quality with app performance and storage constraints
- **Documentation**: Creating clear API documentation for backend integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn package manager
- Mobile development environment (React Native CLI or Expo)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Chao-777/Drug-Speak.git
cd Drug-Speak
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure the backend server connection:
```javascript
// Update API endpoint in your configuration file
const API_BASE_URL = 'your-server-url';
```

4. Run the application:
```bash
npm start
# or
yarn start
```

## 📱 Usage

### For Students

1. **Sign Up/Sign In**: Create an account or log in to track your progress
2. **Browse Drug Library**: Explore categorized pharmaceutical drugs
3. **Listen & Learn**: Play instructor pronunciations at various speeds
4. **Practice**: Record your own pronunciation attempts
5. **Get Scored**: Receive instant feedback on accuracy (0-100 scale)
6. **Track Progress**: Monitor improvement and compete on leaderboards

### Learning Workflow

```
Browse Drug → Listen to Pronunciation → Adjust Speed if Needed → 
Practice Recording → Submit for Evaluation → Receive Score → Review & Retry
```

