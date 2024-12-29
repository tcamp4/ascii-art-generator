# ASCII Art Generator

A modern web application that transforms images into ASCII art, featuring DALL-E integration for AI-generated images. Built with Next.js and React, this tool offers various customization options and real-time preview capabilities.

![ASCII Art Generator Screenshot](screenshot.png)

## Features
- **AI Image Generation**: Generate images using DALL-E AI before converting to ASCII
- **Image to ASCII Conversion**: Convert any uploaded image to ASCII art
- **Multiple Styling Options**:
  - Character Sets: Simple, Detailed, Contrast, Blocks, Braille
  - Color Modes: None (Classic), Grayscale, True Color (RGB)
  - Adjustable settings and real-time preview
- **Special Effects**:
  - Typing animation effect
  - Color inversion
  - Real-time reprocessing
- **Export Options**:
  - Download generated ASCII art as text
  - Download original/generated images
  - Preview original images alongside ASCII output

## Prerequisites
Next.js 13+
React
Tailwind CSS
OpenAI API (DALL-E)

## Installation

1. Clone the repository:
```bash
git clone [https://github.com/tcamp4/ascii-art-generator]
cd ascii-art-generator

Open Repo in VsCode

At Root of project. Adda new file named '.env.local'
insert: OPENAI_API_KEY=your_api_key_here

Open a terminal

Run:
npm install

To start the app:

npm run dev

available at http://localhost:3000