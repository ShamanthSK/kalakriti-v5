# KalaKriti v5.0 - Artist Collaboration Platform

A modern React application for creative collaboration, built with Firebase and deployed on Vercel.

## 🚀 Features

- **User Authentication**: Secure login/registration with Firebase Auth
- **Artist Profiles**: Comprehensive profiles with talents and portfolio
- **Real-time Messaging**: Chat system for collaboration
- **Work Showcase**: Upload and display creative works
- **Smart Matching**: Find collaborators based on skills and interests
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on all devices
- **Live Activity Feed**: See what's happening in the community

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Vercel
- **Styling**: Custom CSS with Tailwind utilities

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kalakriti-v5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage (optional for file uploads)
   - Get your Firebase configuration

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

5. **Start development server**
   ```bash
   npm start
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all Firebase environment variables

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting provider

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.js     # Landing page
│   ├── Navigation.js   # Navigation bar
│   ├── LoginModal.js   # Login form
│   ├── RegisterModal.js # Registration form
│   ├── ExplorePage.js  # Artist discovery
│   ├── ProfilePage.js  # User profile
│   ├── MessagesPage.js # Chat system
│   ├── LoadingOverlay.js # Loading component
│   └── Notification.js # Notification system
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── firebase/          # Firebase configuration
│   └── config.js      # Firebase setup
├── App.js             # Main app component
├── index.js           # App entry point
└── index.css          # Global styles
```

## 🔧 Firebase Setup

### Authentication
- Enable Email/Password authentication in Firebase Console
- Users can register and login with email/password

### Firestore Database
Create the following collections:
- `users`: User profiles and data
- `works`: Creative works uploaded by users
- `messages`: Chat messages between users

### Storage (Optional)
- Enable Firebase Storage for file uploads
- Configure security rules for file access

## 🎨 Customization

### Styling
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for theme customization
- All components use Tailwind CSS classes

### Features
- Add new pages in `src/components/`
- Update navigation in `src/components/Navigation.js`
- Modify authentication logic in `src/contexts/AuthContext.js`

## 🔒 Security

- Firebase Authentication handles user security
- Firestore security rules protect data
- Environment variables keep API keys secure
- HTTPS enforced in production

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Performance

- React 18 with concurrent features
- Optimized bundle size
- Lazy loading for better performance
- CDN deployment via Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Firebase documentation
- Review the React documentation

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Following the repository
- Checking the release notes
- Updating dependencies regularly

---

**KalaKriti v5.0** - Connect. Create. Collaborate. 🎨 