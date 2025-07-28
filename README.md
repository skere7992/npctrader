# NPC Trader Configuration Tool

A React TypeScript application for configuring NPC (Non-Player Character) traders in Rust game servers.

## Features

- **Visual Configuration**: Easy-to-use interface for setting up NPC trader configurations
- **Outfit Builder**: Customize NPC appearance with visual outfit building
- **Trade Offer Editor**: Create and manage trade offers with drag-and-drop interface
- **Color Picker**: Customize UI colors and themes
- **Language Translation**: Create custom language files with DeepL AI translation support

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure DeepL API (Optional)**
   
   For automatic language translation features, you'll need a DeepL API key:
   
   - Get a free API key from [DeepL API](https://www.deepl.com/docs-api/)
   - Copy `.env.example` to `.env`
   - Add your API key to the `.env` file:
   
   ```env
   VITE_DEEPL_API_KEY=your-deepl-api-key-here:fx
   ```
   
   **⚠️ Security Note**: Never commit your API key to version control. The `.env` file is already included in `.gitignore`.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Usage

1. **Load Configuration**: The app loads the default `NPCTrader.json` configuration on startup
2. **Edit Settings**: Use the tabs to configure different aspects:
   - General settings (name, cooldowns, etc.)
   - Appearance (outfit, colors)
   - Trade offers (items, prices, requirements)
   - Language files (with optional AI translation)
3. **Export**: Download your configured JSON files for use in your Rust server

## Translation Feature

The language creator allows you to:
- Generate translation files for supported languages
- Use AI-powered translation via DeepL API
- Manually edit translations
- Download language files in the correct format

Supported languages include: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, and many more.

## File Structure

- `src/components/` - React components for different features
- `src/types/config.ts` - TypeScript definitions for configuration
- `src/utils/translation.ts` - Translation utilities and DeepL integration
- `public/NPCTrader.json` - Default configuration file
- `public/icons/` - Game icons and assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## Security

- API keys are configured via environment variables
- Sensitive data is never committed to the repository
- All external API calls are properly validated