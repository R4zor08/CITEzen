import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { FeatureCard } from '../components/FeatureCard';
import {
  FileTextIcon,
  ArrowRightLeftIcon,
  ActivityIcon,
  BellRingIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageSquareIcon,
  SendIcon,
  UserPlusIcon,
  LogInIcon,
  LayoutDashboardIcon,
  FileEditIcon,
  SearchIcon,
  CheckCircle2Icon } from
'lucide-react';
interface LandingPageProps {
  onNavigate: (page: string) => void;
}
const HOW_IT_WORKS_STEPS = [
{
  number: 1,
  title: 'Create Your Account',
  description:
  'Register using your Student ID and set up your password. Quick and easy — takes less than a minute.',
  icon: UserPlusIcon,
  color: 'purple',
  bgGradient: 'from-purple-500/20 to-purple-600/10',
  iconBg: 'bg-purple-500/15',
  iconColor: 'text-purple-400',
  borderHover: 'hover:border-purple-500/40'
},
{
  number: 2,
  title: 'Log In Securely',
  description:
  'Sign in with your credentials. Role-based access ensures you see exactly what you need.',
  icon: LogInIcon,
  color: 'cyan',
  bgGradient: 'from-cyan-500/20 to-cyan-600/10',
  iconBg: 'bg-cyan-500/15',
  iconColor: 'text-cyan-400',
  borderHover: 'hover:border-cyan-500/40'
},
{
  number: 3,
  title: 'Access Your Dashboard',
  description:
  'View your personalized dashboard with all your concerns, notifications, and quick actions.',
  icon: LayoutDashboardIcon,
  color: 'blue',
  bgGradient: 'from-blue-500/20 to-blue-600/10',
  iconBg: 'bg-blue-500/15',
  iconColor: 'text-blue-400',
  borderHover: 'hover:border-blue-500/40'
},
{
  number: 4,
  title: 'Submit a Concern',
  description:
  'Fill out a smart template form tailored to your concern type. Attach files if needed.',
  icon: FileEditIcon,
  color: 'indigo',
  bgGradient: 'from-indigo-500/20 to-indigo-600/10',
  iconBg: 'bg-indigo-500/15',
  iconColor: 'text-indigo-400',
  borderHover: 'hover:border-indigo-500/40'
},
{
  number: 5,
  title: 'Auto-Routed to Department',
  description:
  'Your concern is automatically sent to the right department. No guesswork, no delays.',
  icon: SearchIcon,
  color: 'emerald',
  bgGradient: 'from-emerald-500/20 to-emerald-600/10',
  iconBg: 'bg-emerald-500/15',
  iconColor: 'text-emerald-400',
  borderHover: 'hover:border-emerald-500/40'
},
{
  number: 6,
  title: 'Track & Resolve',
  description:
  'Monitor real-time status updates and get notified when your concern is resolved.',
  icon: CheckCircle2Icon,
  color: 'teal',
  bgGradient: 'from-teal-500/20 to-teal-600/10',
  iconBg: 'bg-teal-500/15',
  iconColor: 'text-teal-400',
  borderHover: 'hover:border-teal-500/40'
}];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const handleNext = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % HOW_IT_WORKS_STEPS.length);
  }, []);
  const handlePrev = useCallback(() => {
    setCurrentStep(
      (prev) =>
      (prev - 1 + HOW_IT_WORKS_STEPS.length) % HOW_IT_WORKS_STEPS.length
    );
  }, []);
  // Auto-play carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, 4000);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);
  const step = HOW_IT_WORKS_STEPS[currentStep];
  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 selection:bg-purple-500/30 pt-16">
      <Navbar user={null} onNavigate={onNavigate} onLogout={() => {}} />

      <main>
        {/* ===== HERO SECTION (Static, Clean) ===== */}
        <section
          id="home"
          className="relative pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-36 lg:pb-48 overflow-hidden">
          
          {/* Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[300px] sm:h-[500px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500 to-transparent blur-[100px] rounded-full" />
          </div>
          <div className="absolute top-1/4 -left-32 sm:-left-64 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 -right-32 sm:-right-64 w-48 sm:w-96 h-48 sm:h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 animate-slide-up leading-tight">
              Simplifying Student
              <br className="hidden sm:block" />
              Concerns <span className="text-gradient">One Click Away</span>
            </h1>

            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 animate-slide-up delay-100 leading-relaxed px-2">
              Eliminate the traditional "pasa-pasahan" process. Submit
              complaints, requests, and suggestions digitally with smart routing
              and real-time tracking.
            </p>

            <div className="flex items-center justify-center animate-slide-up delay-200 px-4 sm:px-0">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base sm:text-lg shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                
                Get Started <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section
          id="features"
          className="py-16 sm:py-20 lg:py-24 bg-dark-800/50 relative border-y border-white/5">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Everything you need to be heard
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-2">
                A premium platform designed to make concern resolution fast,
                transparent, and hassle-free.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <FeatureCard
                icon={FileTextIcon}
                title="Smart Templates"
                description="Pre-made digital forms tailored for specific concerns. No more guessing what information is needed."
                delay={0} />
              
              <FeatureCard
                icon={ArrowRightLeftIcon}
                title="Auto Routing"
                description="Concerns are automatically sent to the correct department based on category. Zero confusion."
                delay={100} />
              
              <FeatureCard
                icon={ActivityIcon}
                title="Real-time Tracking"
                description="Monitor the status of your concern from pending to resolved. Full transparency at every step."
                delay={200} />
              
              <FeatureCard
                icon={BellRingIcon}
                title="Instant Notifications"
                description="Get alerted immediately when there's an update, comment, or resolution to your concern."
                delay={300} />
              
            </div>
          </div>
        </section>

        {/* ===== HOW CITEZEN WORKS — CAROUSEL ===== */}
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                How CITEzen Works
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-2">
                A streamlined process from registration to resolution — in just
                6 simple steps.
              </p>
            </div>

            {/* Carousel Container */}
            <div
              className="relative max-w-4xl mx-auto"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}>
              
              {/* Main Carousel Card */}
              <div className="relative min-h-[280px] sm:min-h-[260px] md:min-h-[240px]">
                {HOW_IT_WORKS_STEPS.map((s, index) => {
                  const StepIcon = s.icon;
                  return (
                    <div
                      key={s.number}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${index === currentStep ? 'opacity-100 translate-x-0 scale-100 z-10' : index < currentStep ? 'opacity-0 -translate-x-12 scale-95 z-0' : 'opacity-0 translate-x-12 scale-95 z-0'}`}>
                      
                      <div
                        className={`glass-panel p-6 sm:p-8 md:p-12 ${s.borderHover} transition-all duration-300 h-full`}>
                        
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8 md:gap-10">
                          {/* Icon + Number */}
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl ${s.iconBg} flex items-center justify-center border border-white/10 transition-all duration-300`}>
                              
                              <StepIcon
                                className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ${s.iconColor}`} />
                              
                              <div className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-500/30 border-2 border-dark-900">
                                {s.number}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="text-center sm:text-left flex-1">
                            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2">
                              Step {s.number} of {HOW_IT_WORKS_STEPS.length}
                            </div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">
                              {s.title}
                            </h3>
                            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg">
                              {s.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>);

                })}
              </div>

              {/* Navigation Arrows + Dots */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={handlePrev}
                  className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Previous step">
                  
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Dots Indicator */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {HOW_IT_WORKS_STEPS.map((_, index) =>
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`rounded-full transition-all duration-300 ${index === currentStep ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-purple-500' : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/20 hover:bg-white/40'}`}
                    aria-label={`Go to step ${index + 1}`} />

                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Next step">
                  
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Step Progress Bar */}
              <div className="mt-4 sm:mt-6 max-w-xs sm:max-w-md mx-auto">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(currentStep + 1) / HOW_IT_WORKS_STEPS.length * 100}%`
                    }} />
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT SECTION ===== */}
        <section
          id="about"
          className="py-16 sm:py-20 lg:py-24 bg-dark-800/50 relative border-y border-white/5">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-0 lg:hidden">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                About CITEzen
              </h2>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
              <div className="flex-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
                <h2 className="hidden lg:block text-3xl md:text-4xl font-bold text-white">
                  About CITEzen
                </h2>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  CITEzen was developed to bridge the gap between students and
                  the administration. We understand that navigating university
                  processes can sometimes be confusing and time-consuming.
                </p>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Our mission is to provide a centralized, transparent, and
                  efficient platform where every student's voice is heard and
                  every concern is addressed promptly by the right department.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 shrink-0" />
                    <span className="text-gray-300 text-sm sm:text-base font-medium">
                      Secure & Confidential
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 shrink-0" />
                    <span className="text-gray-300 text-sm sm:text-base font-medium">
                      Student-Centric
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full max-w-full sm:max-w-md lg:max-w-none relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
                <div className="glass-panel p-1.5 sm:p-2 md:p-3 relative z-10 rounded-xl sm:rounded-2xl overflow-hidden">
                  <img
                    src="/pasted-image.jpg"
                    alt="NEMSU Association of Computer Science Students"
                    className="w-full h-auto rounded-lg sm:rounded-xl object-cover aspect-video" />
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section
          id="contact"
          className="py-16 sm:py-20 lg:py-24 relative bg-dark-800/30 border-t border-white/5">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-2">
                Have questions or need assistance? Our support team is here to
                help.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
              {/* Contact Info */}
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-panel p-5 sm:p-6 md:p-8 flex items-start gap-3 sm:gap-4 hover:border-purple-500/30 transition-colors duration-300">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      Visit Us
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base">
                      NEMSU Campus, Main Building
                      <br />
                      Room 101, Student Affairs Office
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-5 sm:p-6 md:p-8 flex items-start gap-3 sm:gap-4 hover:border-cyan-500/30 transition-colors duration-300">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                    <MailIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      Email Us
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base break-all sm:break-normal">
                      support@citezen.nemsu.edu.ph
                      <br />
                      admin@nemsu.edu.ph
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-5 sm:p-6 md:p-8 flex items-start gap-3 sm:gap-4 hover:border-emerald-500/30 transition-colors duration-300">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      Call Us
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base">
                      (086) 123-4567
                      <br />
                      Mon-Fri, 8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="glass-panel p-5 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  Send a Message
                </h3>
                <form
                  className="space-y-4 sm:space-y-5"
                  onSubmit={(e) => e.preventDefault()}>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        className="block w-full bg-dark-800/50 border border-white/10 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-dark-800/80"
                        placeholder="John Doe" />
                      
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="block w-full bg-dark-800/50 border border-white/10 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-dark-800/80"
                        placeholder="john@example.com" />
                      
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="block w-full bg-dark-800/50 border border-white/10 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-dark-800/80"
                      placeholder="How can we help?" />
                    
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="block w-full bg-dark-800/50 border border-white/10 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none hover:bg-dark-800/80"
                      placeholder="Write your message here..." />
                    
                  </div>
                  <button
                    type="button"
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm sm:text-base font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]">
                    
                    Send Message{' '}
                    <SendIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-dark-900 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/Gemini_Generated_Image_u7mgetu7mgetu7mg.png"
                alt="CITEzen Logo"
                className="h-8 w-8 object-cover rounded-full border border-white/10" />
              
              <span className="text-xl font-bold text-white">
                CITE<span className="text-gradient">zen</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400">
              <a
                href="#home"
                className="hover:text-purple-400 transition-colors">
                
                Home
              </a>
              <a
                href="#features"
                className="hover:text-purple-400 transition-colors">
                
                Features
              </a>
              <a
                href="#about"
                className="hover:text-purple-400 transition-colors">
                
                About
              </a>
              <a
                href="#contact"
                className="hover:text-purple-400 transition-colors">
                
                Contact
              </a>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} CITEzen Student Concern Management
              System. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}