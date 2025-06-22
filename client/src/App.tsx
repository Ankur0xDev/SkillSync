import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Contexts/AuthContext';
import { ThemeProvider } from './Contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { IntroductionGuide } from './components/IntroductionGuide';
import { ChatPage } from './pages/ChatPage';
// Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { MatchesPage } from './pages/MatchesPage';
import { SearchPage } from './pages/SearchPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { CommunityPage } from './pages/CommunityPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import CreateProfilePage from './pages/CreateProfilePage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';
import {SettingsPage} from './pages/SettingsPage'
import DirectChat from './components/DirectChat';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile/:id" element={<PublicProfilePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
               
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/profile/edit" element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/matches" element={
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                } />
                <Route path="/connections" element={
                  <ProtectedRoute>
                    <ConnectionsPage />
                  </ProtectedRoute>
                } />

                <Route path="/chat/:userId" element={
                  <ProtectedRoute>
                    <DirectChat />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/create-profile" element={
                  <ProtectedRoute>
                    <CreateProfilePage />
                  </ProtectedRoute>
                } />
                <Route path='/settings' element={
                  <ProtectedRoute>
                    <SettingsPage/>
                  </ProtectedRoute>
                  
                }/>
                <Route path='/team-dashboard/:projectId' element={<TeamDashboardPage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                }
              }}
            />
            <IntroductionGuide />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;