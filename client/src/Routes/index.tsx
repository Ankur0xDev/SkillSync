import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { IntroductionGuide } from '../components/IntroductionGuide'
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { ProfilePage } from '../pages/ProfilePage';
import { EditProfilePage } from '../pages/EditProfilePage';
import { MatchesPage } from '../pages/MatchesPage';
import { SearchPage } from '../pages/SearchPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ConnectionsPage } from '../pages/ConnectionsPage';
import { PublicProfilePage } from '../pages/PublicProfilePage';
import { HelpCenterPage } from '../pages/HelpCenterPage';
import { CommunityPage } from '../pages/CommunityPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '../pages/TermsOfServicePage';
import { ChatPage } from '../pages/ChatPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { TeamDashboardPage } from '../pages/TeamDashboardPage';
import CreateProfilePage from '../pages/CreateProfilePage';
import DirectChat from '../components/DirectChat';

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          
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
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/chat/:userId" element={
            <ProtectedRoute>
              <DirectChat />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/team-dashboard/:projectId" element={
            <ProtectedRoute>
              <TeamDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
        <IntroductionGuide />
      </main>
      <Footer />
    </>
  );
};

export default AppRoutes; 