import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { HowItWorks } from './components/HowItWorks';
import { PriceCalculator } from './components/PriceCalculator';
import { CoverageZones } from './components/CoverageZones';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { OrderWizard } from './components/OrderWizard';
import { OrderTracking } from './components/OrderTracking';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { ChatAssistant } from './components/ChatAssistant';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <main className="min-h-screen pb-16 md:pb-0">
      {activeView === 'home' && (
        <>
          <Hero />
          <ServicesSection />
          <HowItWorks />
          <PriceCalculator />
          <CoverageZones />
          <Testimonials />
          <FAQ />
        </>
      )}

      {activeView === 'services' && (
        <div className="pt-6">
          <ServicesSection />
          <PriceCalculator />
          <FAQ />
        </div>
      )}

      {activeView === 'how-it-works' && (
        <div className="pt-6">
          <HowItWorks />
          <CoverageZones />
          <FAQ />
        </div>
      )}

      {activeView === 'pricing' && (
        <div className="pt-6">
          <PriceCalculator />
          <CoverageZones />
          <FAQ />
        </div>
      )}

      {activeView === 'wizard' && (
        <div className="pt-6">
          <OrderWizard />
        </div>
      )}

      {activeView === 'tracking' && (
        <div className="pt-6">
          <OrderTracking />
        </div>
      )}

      {activeView === 'dashboard' && (
        <div className="pt-6">
          <UserDashboard />
        </div>
      )}

      {activeView === 'admin' && (
        <div className="pt-6">
          <AdminPanel />
        </div>
      )}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900 flex flex-col justify-between">
        <Header />
        <MainContent />
        <Footer />
        <BottomNav />
        <ChatAssistant />
        <CartDrawer />
        <FloatingCartButton />
        <AuthModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
