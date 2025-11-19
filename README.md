<p align="left">
  <picture>
  <!-- Source for dark mode -->
  <source media="(prefers-color-scheme: dark)" srcset="public/images/logo_full_white.webp">
  <!-- Fallback image for light mode and other clients -->
  <img alt="Ex Your Ex Logo" src="public/images/logo_full_black.webp" width="300">
</picture>

</p>

![Website Status](https://img.shields.io/website?url=https://exorciseyourex.com)
![Firebase Hosting](https://img.shields.io/badge/hosting-firebase-orange)
![React](https://img.shields.io/badge/react-19.1.1-blue)

**🌐 [Visit Live Site](https://exorciseyourex.com)**

# Exorcise Your Ex

Exorcise Your Ex is an interactive web experience created to promo Good Kid Band's new song Rift. It follows the player receiving and using a fictional exorcism kit to "exorcise" the feelings of heartbreak and emptiness that one might feel after a breakup.

## Features

-   **Quiz:** Personality quiz determines what kind of spirit the user will become when they die.
-   **Tarot:** Interactive tarot reading lets users diving their future with Good Kid themed tarot cards from 11 differt artists.
-   **Ritual:** Final interactive ritual cutscene where users summon the spirit of their heartbreak and let it go.
-   **Mobile Friendly:** Responsive, often completely different design for desktop and mobile.
-   **Shareable Results:** Users can share their quiz results with in-depth metadata.
-   **Metadata for Bots:** Static metadata pages can be generated for better link previews and SEO.

## Tech Stack

-   **React** (SPA)
-   **Vite** (build tool)
-   **Firebase** (hosting, database)
-   **Howler.js** (audio)
-   **react-helmet** (metadata management)
-   **React Router** (routing)

## Development

-   Hot Module Replacement (HMR) for fast development.
-   ESLint for code quality.
-   Easily extensible for new ritual steps or features.

## Getting Started

1. Install dependencies:
    ```bash
    npm install
    ```
2. Start development server:
    ```bash
    npm run dev
    ```
3. Build for production:
    ```bash
    npm run build
    ```
4. Deploy to Firebase:
    ```bash
    firebase deploy --only hosting
    ```
