# Rust NPC Trader Configuration Website

A React-based web application for configuring NPC Trader settings in Rust.

## Deployment Configuration

This application supports deployment to both GitHub Pages and custom domains through configurable base paths.

### For Custom Domain Deployment

When deploying to a custom domain, the app should be served from the root path:

1. Create a `.env` file or set environment variable:
   ```bash
   VITE_BASE_PATH=/
   ```

2. Build the application:
   ```bash
   npm run build
   ```

The built files will reference assets from the root path, suitable for custom domain hosting.

### For GitHub Pages Deployment

When deploying to GitHub Pages (username.github.io/repository-name), the app needs the repository name as base path:

1. Set the environment variable:
   ```bash
   VITE_BASE_PATH=/npctrader/
   ```

2. Build the application:
   ```bash
   npm run build
   ```

The GitHub Actions workflow is pre-configured to set this automatically for GitHub Pages deployment.

### Environment Files

For convenience, example environment files are provided:

- `.env.custom` - Configuration for custom domain deployment
- `.env.github` - Configuration for GitHub Pages deployment  
- `.env.example` - Documentation of available options

To use these, copy the appropriate file to `.env`:

```bash
# For custom domain
cp .env.custom .env

# For GitHub Pages  
cp .env.github .env
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- **General Settings**: Configure NPC display name
- **Appearance**: Choose from preset skin sets or build custom outfits
- **Cooldowns**: Set trade cooldowns for regular and VIP players
- **Language**: Configure language settings and create custom language files
- **Notifications**: Configure NCP integration and notification types
- **UI Colors**: Customize the UI color scheme
- **Trade Offers**: Create and manage trade offers with items and rewards

## Configuration

The application loads `NPCTrader.json` from the public folder as the default configuration. You can upload your own configuration file or download the modified configuration after making changes.