# REDD EcoRescue - Wildlife Conservation Game

An interactive 8-bit themed game that promotes wildlife conservation for elementary students.

## Features

- 🎮 **8-bit Retro Theme** - Classic pixel art style with authentic retro aesthetics
- 🎵 **Sound Integration** - Background music and sound effects using Howler.js
- 🌿 **Wildlife Conservation Focus** - Educational content about endangered species
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚙️ **Settings Menu** - Volume control and audio preferences
- 🎯 **Elementary Student Friendly** - Simple controls and engaging interface

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Adding Sound Effects

To enable audio features, add the following sound files to the `/public/sounds/` directory:

- `8bit-nature-loop.mp3` - Background nature music (looping)
- `8bit-button.mp3` - Button click sound effect
- `8bit-start.mp3` - Game start fanfare

See `/public/sounds/README.md` for detailed instructions on finding and adding sound files.

## Game Structure

### Title Screen
- Main game title with glowing animation
- Animated wildlife sprites (lion, elephant, giraffe, panda)
- Start Game and Settings buttons
- Basic game instructions

### Settings Screen
- Music volume control slider
- Play/Pause music toggle
- Audio status indicators

### Game Screen (Coming Soon)
- Interactive wildlife conservation gameplay
- Educational content about endangered species
- Environmental protection themes

## Technology Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Howler.js** - Audio management library
- **CSS3** - Custom 8-bit themed styling
- **Google Fonts** - Press Start 2P for authentic pixel font

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # 8-bit themed styles
├── main.jsx         # Application entry point
└── index.css        # Global styles

public/
├── sounds/          # Audio files directory
│   └── README.md    # Sound setup instructions
└── vite.svg         # Vite logo
```

## Educational Goals

This game aims to:

- 🌍 **Raise Awareness** - Teach students about endangered species
- 🎓 **Educational Value** - Provide interactive learning about wildlife conservation
- 🎮 **Engagement** - Make learning fun through gamification
- 🌱 **Environmental Stewardship** - Foster care for the environment

## Contributing

This project is designed for educational purposes. Contributions that enhance the educational value or improve the user experience are welcome.

## License

This project is created for educational purposes focused on wildlife conservation awareness.
