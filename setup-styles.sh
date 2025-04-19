#!/bin/bash

echo "Setting up modern ecommerce styling for buyer-app..."

# Install Tailwind plugins
npm install -D @tailwindcss/forms @tailwindcss/aspect-ratio @tailwindcss/line-clamp

# Install React Icon library if not already installed
npm install react-icons

# Install other useful UI dependencies
npm install react-transition-group framer-motion

echo "✅ All styling dependencies have been installed."
echo "Run 'npm run dev' to see the updated styling." 