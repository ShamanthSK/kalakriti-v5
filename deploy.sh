#!/bin/bash

# KalaKriti v5.0 Deployment Script

echo "🚀 Starting KalaKriti v5.0 deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your Firebase configuration:"
    echo ""
    echo "REACT_APP_FIREBASE_API_KEY=your_api_key_here"
    echo "REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com"
    echo "REACT_APP_FIREBASE_PROJECT_ID=your_project_id"
    echo "REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com"
    echo "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id"
    echo "REACT_APP_FIREBASE_APP_ID=your_app_id"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel (if vercel is installed)
    if command -v vercel &> /dev/null; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
    else
        echo "📁 Build completed! The 'build' folder is ready for deployment."
        echo "To deploy to Vercel, run: npm i -g vercel && vercel"
        echo "Or upload the 'build' folder to your hosting provider."
    fi
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi

echo "🎉 Deployment script completed!" 