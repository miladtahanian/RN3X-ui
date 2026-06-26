# Changelog

## [1.0.5] - 2026-06-26

### Added
- Settings page divided into sub-pages: About, API, Operations, Panel, and Sub settings
- Tokens and API key management (`SettingsApiScreen`)
- Server operations and management screen (`SettingsOperationsScreen`)
- Settings panel screen (`SettingsPanelScreen`)
- Settings sub-screen (`SettingsSubScreen`)
- Reusable settings components (`SettingsComponents`)
- New API client methods for tokens and clients
- Constants file for centralized configuration
- More information displayed on Dashboard (Online Users, AVG Load, etc.)
- GitHub Pages deployment workflow improvements

### Fixed
- Dashboard problems including Online Users and AVG Load calculation
- Subscription parsing issues
- **Scaling and bottom navigation bar positioning on smaller phones** ([#2](https://github.com/miladtahanian/RN3X-ui/issues/2))
- Various UI components and API calls

### Changed
- Complete Settings screen refactored into modular sub-screens
- DashboardScreen updated with additional info and fixes
- i18n translations updated for new screens
- Storage utility improvements
- `AppNavigator` updated for new settings routes
- README fully rewritten
- GitHub Pages deployment workflow streamlined

### Removed
- Redundant deploy-landing workflow (merged into deploy-pages)
- Old monolithic SettingsScreen code
- Outdated images from docs/

## [1.0.4] - 2026-06-26

### Added
- User Account Manager for multi-server account management
- QR code generation for subscriptions
- Manual subscription link and port configuration
- New API endpoint for user accounts

### Changed
- `ClientDetailScreen` enhanced with QR code display and account management
- `SettingsScreen` updated with manual subscription settings
- i18n translations extended for new features
- `SafeAreaView` improvements for full-screen experience

### Fixed
- Layout improvements for better screen adaptation

## [1.0.3] - 2026-06-25

### Added
- GitHub Actions native APK build workflow (replaces EAS)
- Landing page deployed to GitHub Pages via manual workflow
- Vazirmatn Persian font for RTL text rendering
- Screenshots section in docs
- Server Manager screen for multi-server management

### Fixed
- Persian text rendering with proper RTL font support
- Centering issues in the landing page

### Changed
- APK build switched from EAS to native GitHub Actions
- EAS build workflow and configuration removed
- `SettingsScreen` extended with server management options
- `AuthContext` updated for multi-server support
- `LoginScreen` enhanced with server management UI
- `AppNavigator` updated with accounts route
- Storage utilities improved

### Removed
- EAS build workflow and config files

## [1.0.2] - 2026-06-25

### Added
- App icons (adaptive icon, favicon, splash icon, etc.)
- New images for documentation

### Changed
- UI improvements and more server operations
- `SettingsScreen` significantly expanded with new features
- i18n translations extended
- Server API and settings API updated

## [1.0.1] - 2026-06-25

### Fixed
- Login issues and authentication flow
- UI components and API call handling
- Dashboard display problems

### Changed
- API client methods improved
- `ClientDetailScreen` and `ClientsScreen` UI fixes
- `DashboardScreen` data loading optimized
- `check_api.py` script improvements

## [1.0.0] - 2026-06-24

### Added
- Initial release of RN3X-ui
- Authentication system with login screen
- Dashboard with server statistics
- Client management (list, detail, CRUD operations)
- Inbound management
- Settings screen
- Multi-language support (i18n) with English and Persian
- Dark/light theme support
- API integration for 3X-UI panel
- `AppNavigator` with drawer and tab navigation
- Persistent storage utilities
