# Desktop App Build Instructions

Your app is now configured as a desktop application using Electron!

## Setup Steps

1. **Export to GitHub** and clone your repository locally
2. **Install dependencies**: `npm install`

## Add These Scripts to package.json

Add these scripts to your `package.json` file:

```json
"scripts": {
  "electron": "NODE_ENV=development electron electron/main.js",
  "electron:dev": "npm run dev & npm run electron",
  "electron:build": "npm run build && electron-builder",
  "electron:build:win": "npm run build && electron-builder --win",
  "electron:build:mac": "npm run build && electron-builder --mac",
  "electron:build:linux": "npm run build && electron-builder --linux"
}
```

## Running in Development

```bash
# Start Vite dev server and Electron app
npm run electron:dev
```

Or separately:
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron
```

## Building Executables

```bash
# Build for all platforms (current OS)
npm run electron:build

# Build for specific platform
npm run electron:build:win    # Windows .exe
npm run electron:build:mac    # macOS .dmg
npm run electron:build:linux  # Linux AppImage
```

**Note**: To build for macOS, you need to be on a Mac. For Windows, you need Windows or can use wine. Linux can build for Linux.

## Output

Built executables will be in the `release/` folder.

## Distribution

You can distribute the built executable files to users who can then install and run your app without needing a browser or Node.js.
