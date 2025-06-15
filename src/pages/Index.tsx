import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import DashboardTitle from '@/components/ui/DashboardTitle';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Index = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    refetch
  } = useGoogleSheets();
  const handleSectionClick = (sectionId: string) => {
    navigate(`/${sectionId}`);
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-slate-800/20 to-gray-800/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-slate-900/20 to-gray-900/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-slate-700/30 to-gray-700/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>

        {/* Main Loader Container */}
        <div className="relative z-10 text-center space-y-12">
          {/* Beautiful Modern Loader */}
          <div className="relative flex items-center justify-center">
            {/* Outer rotating rings */}
            <div className="absolute w-48 h-48">
              <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin" style={{
              background: 'conic-gradient(from 0deg, transparent, #1e293b, #475569, transparent)',
              animationDuration: '3s'
            }}>
              </div>
            </div>
            <div className="absolute w-40 h-40">
              <div className="absolute inset-0 border-3 border-transparent rounded-full animate-spin" style={{
              background: 'conic-gradient(from 180deg, transparent, #374151, #6b7280, transparent)',
              animationDuration: '2s',
              animationDirection: 'reverse'
            }}>
              </div>
            </div>
            <div className="absolute w-32 h-32">
              <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin" style={{
              background: 'conic-gradient(from 90deg, transparent, #4b5563, #9ca3af, transparent)',
              animationDuration: '4s'
            }}>
              </div>
            </div>
            
            {/* Center circle with 57 - NO FADING */}
            <div className="relative w-28 h-28 bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-700/50">
              {/* Inner glow ring */}
              <div className="absolute inset-1 bg-gradient-to-br from-slate-600/30 to-transparent rounded-full animate-spin" style={{
              animationDuration: '8s'
            }}></div>
              
              {/* Subtle pulsing inner ring */}
              <div className="absolute inset-2 rounded-full border border-slate-500/30 animate-pulse" style={{
              animationDuration: '2s'
            }}></div>
              
              {/* 57 Text - Bigger and NO FADING */}
              <div className="relative z-10">
                <span className="text-5xl font-bold text-white font-serif tracking-tight drop-shadow-2xl">57</span>
              </div>
              
              {/* Rotating subtle highlight */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-white/40 rounded-full animate-spin" style={{
              animationDuration: '3s'
            }}></div>
            </div>
            
            {/* Orbiting particles with dark colors */}
            <div className="absolute w-3 h-3 bg-slate-600 rounded-full shadow-lg animate-spin" style={{
            top: '-20px',
            right: '30px',
            animationDuration: '4s',
            transformOrigin: '0 140px'
          }}>
            </div>
            <div className="absolute w-2 h-2 bg-gray-700 rounded-full shadow-lg animate-spin" style={{
            bottom: '-15px',
            left: '35px',
            animationDuration: '3s',
            animationDirection: 'reverse',
            transformOrigin: '0 -120px'
          }}>
            </div>
            <div className="absolute w-2.5 h-2.5 bg-slate-800 rounded-full shadow-lg animate-spin" style={{
            top: '40px',
            left: '-25px',
            animationDuration: '5s',
            transformOrigin: '100px 0'
          }}>
            </div>
          </div>

          {/* Elegant Brand Text */}
          <div className="space-y-4">
            <h1 className="text-3xl font-light text-slate-800 tracking-wide font-serif">
              <span className="font-extralight">Physique</span>{' '}
              <span className="font-bold bg-gradient-to-r from-slate-800 via-gray-800 to-black bg-clip-text text-transparent">57</span>
            </h1>
            <p className="text-lg text-slate-600/80 font-light">
              Loading your dashboard...
            </p>
          </div>

          {/* Animated dots with dark colors */}
          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full animate-bounce shadow-lg"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full animate-bounce shadow-lg animation-delay-1000"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full animate-bounce shadow-lg animation-delay-2000"></div>
          </div>

          {/* Progress bar with dark gradient */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl max-w-lg">
          <CardContent className="text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Refined Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white to-gray-50/20"></div>
        
        {/* Elegant Barre Workout Silhouette */}
        <div className="absolute right-0 top-0 h-full w-2/5 opacity-3">
          <svg viewBox="0 0 400 600" className="h-full w-full">
            {/* Barre */}
            <rect x="80" y="140" width="240" height="6" rx="3" fill="currentColor" className="text-slate-300" />
            
            {/* Refined Woman Figure */}
            <g className="animate-pulse" style={{
            animationDuration: '6s'
          }}>
              {/* Head */}
              <circle cx="200" cy="90" r="22" fill="currentColor" className="text-slate-400" />
              
              {/* Hair in Bun */}
              <circle cx="190" cy="75" r="12" fill="currentColor" className="text-slate-500" />
              
              {/* Torso */}
              <ellipse cx="200" cy="190" rx="35" ry="75" fill="currentColor" className="text-slate-400" />
              
              {/* Arms in Barre Position */}
              <ellipse cx="170" cy="150" rx="12" ry="45" fill="currentColor" className="text-slate-400" transform="rotate(-20 170 150)" />
              <ellipse cx="230" cy="150" rx="12" ry="45" fill="currentColor" className="text-slate-400" transform="rotate(20 230 150)" />
              
              {/* Legs in Elegant Barre Pose */}
              <ellipse cx="185" cy="310" rx="15" ry="65" fill="currentColor" className="text-slate-400" transform="rotate(-10 185 310)" />
              <ellipse cx="215" cy="310" rx="15" ry="65" fill="currentColor" className="text-slate-400" transform="rotate(35 215 310)" />
              
              {/* Ballet Feet */}
              <ellipse cx="170" cy="385" rx="10" ry="6" fill="currentColor" className="text-slate-500" />
              <ellipse cx="240" cy="365" rx="10" ry="6" fill="currentColor" className="text-slate-500" />
            </g>
          </svg>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-32 left-16 w-24 h-24 bg-slate-200/20 rounded-full blur-2xl"></div>
        <div className="absolute top-64 right-32 w-32 h-32 bg-gray-200/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-24 w-28 h-28 bg-slate-100/25 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Refined Header Section */}
          <header className="mb-20 text-center">
            {/* Business Badge - Full Width */}
            <div className="inline-flex items-center justify-center mb-8 w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-12 py-4 rounded-full text-base font-medium shadow-xl w-full text-center tracking-wide">
                Business Intelligence Dashboard
              </div>
            </div>
            
            {/* Main Title with Stylish Font */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-4 tracking-tight font-serif">
              <span className="font-extralight">Physique</span>{' '}
              <span className="font-bold animate-color-cycle text-8xl">57</span>
              <span className="text-slate-600 font-light">, India</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced Business Analytics
            </p>
            
            {/* Refined Stats Cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-slate-200/50">
                <div className="text-3xl font-bold text-slate-900">Real-time</div>
                <div className="text-sm text-slate-600 font-medium">Data Insights</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-slate-200/50">
                <div className="text-3xl font-bold text-slate-900">8+</div>
                <div className="text-sm text-slate-600 font-medium">Analytics Modules</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-slate-200/50">
                <div className="text-3xl font-bold text-slate-900">Precision</div>
                <div className="text-sm text-slate-600 font-medium">Data Accuracy</div>
              </div>
            </div>

            {/* Elegant Divider */}
            <div className="w-24 h-px bg-slate-300 mx-auto mb-8"></div>
          </header>

          {/* Dashboard Grid */}
          <main className="max-w-7xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-slate-200/30">
              <DashboardGrid onButtonClick={handleSectionClick} />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        @keyframes color-cycle {
          0% { color: #3b82f6; }
          25% { color: #ef4444; }
          50% { color: #6366f1; }
          75% { color: #8b5cf6; }
          100% { color: #3b82f6; }
        }
        
        .animate-color-cycle {
          animation: color-cycle 4s infinite ease-in-out;
        }
      `}</style>
    </div>;
};
export default Index;