import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useThemeProvider, ThemeContext } from './hooks/useTheme';
import { useConcerns } from './hooks/useConcerns';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Loader2Icon } from 'lucide-react';
import { Toaster } from 'sonner';
type Page =
'landing' |
'login' |
'register' |
'student-dashboard' |
'staff-dashboard' |
'admin-dashboard';
export function App() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  } = useAuth();
  const themeValue = useThemeProvider();
  const concernsData = useConcerns(user);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  // Handle routing based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // If logged in but on a public page, redirect to dashboard
        if (['landing', 'login', 'register'].includes(currentPage)) {
          setCurrentPage(`${user.role}-dashboard` as Page);
        } else if (currentPage !== `${user.role}-dashboard`) {
          // Role-based access control: Prevent accessing other roles' dashboards
          setCurrentPage(`${user.role}-dashboard` as Page);
        }
      } else {
        // If not logged in but on a protected page, redirect to landing
        if (currentPage.includes('dashboard')) {
          setCurrentPage('landing');
        }
      }
    }
  }, [isAuthenticated, user, isLoading, currentPage]);
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleLogout = () => {
    logout();
    handleNavigate('landing');
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-white">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 mb-6 animate-pulse">
          <img
            src="/Gemini_Generated_Image_u7mgetu7mgetu7mg.png"
            alt="CITEzen Logo"
            className="h-20 w-20 object-cover rounded-full" />
          
        </div>
        <Loader2Icon className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="mt-4 text-gray-400 font-medium tracking-widest uppercase text-sm">
          Loading CITEzen...
        </p>
      </div>);

  }
  // Render current page
  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="min-h-screen bg-dark-900 text-gray-200 font-sans selection:bg-purple-500/30">
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e5e7eb'
            }
          }} />
        
        {currentPage === 'landing' &&
        <LandingPage onNavigate={handleNavigate} />
        }

        {currentPage === 'login' &&
        <LoginPage onLogin={login} onNavigate={handleNavigate} />
        }

        {currentPage === 'register' &&
        <RegisterPage onRegister={register} onNavigate={handleNavigate} />
        }

        {currentPage === 'student-dashboard' && user?.role === 'student' &&
        <StudentDashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          concernsData={concernsData}
          onUpdateUser={updateUser} />

        }

        {currentPage === 'staff-dashboard' && user?.role === 'staff' &&
        <StaffDashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          concernsData={concernsData}
          onUpdateUser={updateUser} />

        }

        {currentPage === 'admin-dashboard' && user?.role === 'admin' &&
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          concernsData={concernsData}
          onUpdateUser={updateUser} />

        }
      </div>
    </ThemeContext.Provider>);

}