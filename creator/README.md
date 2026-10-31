# Sprite Creator

A modern sprite editor built with Vite + React. Edit sprites in your browser — crop, resize, flip, rotate, adjust colors, and remove backgrounds.

## Getting Started

```bash
cd creator
npm install
npm start
```

## Features

- **Crop & Resize** — precise cropping and arbitrary resizing
- **Flip & Rotate** — horizontal/vertical flip, 90°/270° rotation
- **Color Adjustments** — brightness, contrast, saturation, hue rotation
- **Eraser & BG Removal** — erase to transparency or remove a background color
- **Sprite Sheet Builder** — stitch multiple sprites together

## Build

```bash
npm run build
```

## Infrastructure

The CDK stack in `infrastructure/` deploys the built app to S3 + CloudFront.
