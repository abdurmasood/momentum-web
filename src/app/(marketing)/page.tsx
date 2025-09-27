import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-20 py-4">
        <div className="flex items-center">
          <Logo className="w-8 h-10 text-white" />
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">
            Features
          </a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm">
            Pricing
          </a>
          <a href="#resources" className="text-gray-300 hover:text-white transition-colors text-sm">
            Resources
          </a>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-md px-3 py-1.5 text-sm h-8"
          >
            Sign in
          </Button>
          <Button 
            size="sm"
            className="bg-gray-200 text-black hover:bg-gray-300 rounded-md px-3 py-1.5 text-sm h-8"
          >
            Download
          </Button>
        </div>
      </nav>
      
      {/* Hero Section */}
      <main className="flex flex-col items-start px-20 pt-[15vh] pb-16 min-h-[calc(100vh-80px)]">
        <div className="max-w-3xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-light leading-tight mb-3 font-sans">
            Plan your day,
            <br />
            extraordinarily simple.
          </h1>
          
          <p className="text-base text-gray-400 mb-5 max-w-lg leading-relaxed font-sans">
            Momentum helps you organize your day with focus and clarity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="bg-gray-200 text-black hover:bg-gray-300 rounded-md px-5 py-2.5 text-sm w-fit"
            >
              Download for macOS ↓
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
