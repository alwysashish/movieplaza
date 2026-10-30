import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { AdminRoute } from './components/AdminRoute.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { MoviesPage } from './pages/MoviesPage.js';
import { MovieDetailsPage } from './pages/MovieDetailsPage.js';
import { SeatSelectionPage } from './pages/SeatSelectionPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ConfirmationPage } from './pages/ConfirmationPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#0b0b0f] text-neutral-100 selection:bg-[#e50914] selection:text-white">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage />} />
              <Route path="/seat-selection/:showtimeId" element={<SeatSelectionPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/checkout/:showtimeId"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation/:bookingId"
                element={
                  <ProtectedRoute>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Route */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#16161d',
                color: '#f3f4f6',
                border: '1px solid #272733',
                fontSize: '12px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#e50914',
                  secondary: '#ffffff'
                }
              }
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
