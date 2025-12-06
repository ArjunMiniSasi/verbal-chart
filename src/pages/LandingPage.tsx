import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  FileText, 
  Clock, 
  DollarSign, 
  Heart, 
  Shield, 
  ArrowRight, 
  Play,
  Star,
  Users,
  TrendingUp,
  Brain,
  Pill,
  Eye,
  Smile,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState('transcription');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartTrial = () => {
    navigate('/dashboard');
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const features = {
    transcription: {
      title: 'Real-time Voice Transcription',
      description: 'Advanced speech recognition with 99.8% accuracy for veterinary terminology. Speak naturally while examining pets—AI handles the documentation.',
      icon: Mic,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    soap: {
      title: 'Auto SOAP Notes Generation',
      description: 'AI converts your conversations into structured SOAP format instantly. Perfect veterinary records without the typing stress.',
      icon: FileText,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    prescriptions: {
      title: 'Smart Prescriptions',
      description: 'Complete prescriptions with dosage, frequency, and follow-up plans generated automatically from your voice notes.',
      icon: Pill,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Medora AI</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Pricing</a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Resources</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">About</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Log in
              </Button>
              <Button
                onClick={handleStartTrial}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="text-center mb-6">
            <Badge className="bg-green-50 text-green-600 border-green-200 px-3 py-1 text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
              Trusted by 1,000+ Veterinary Clinics
            </Badge>
              </div>

              {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AI-powered SOAP notes
                <br />
              <span className="text-blue-600">for modern veterinary care</span>
              </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
              Transform consultations into complete veterinary documentation in seconds.
            </p>
            
            {/* Metrics That Move Forward */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Metrics That Move Forward</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 px-4 py-2 text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer">
                  <Eye className="w-4 h-4 inline mr-2" />
                  Accuracy
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-green-300 px-4 py-2 text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Speed
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300 px-4 py-2 text-sm font-medium hover:bg-purple-200 transition-colors cursor-pointer">
                  <Smile className="w-4 h-4 inline mr-2" />
                  Satisfaction
                </Badge>
              </div>
              </div>

              {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold shadow-lg"
                >
                Start free trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 bg-white text-black hover:bg-gray-50 hover:text-black px-8 py-6 text-lg font-semibold"
              >
                Book a demo
              </Button>
            </div>
                  </div>

          {/* Product Demo - Prominent with Glass Morphism */}
          <div className="mt-6 max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Glass Morphism Video Container */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                {/* Glass morphism overlay */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
                
                {/* Video */}
                <video 
                  ref={videoRef}
                  src="/assets/videos/product-demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative w-full h-full object-contain z-10"
                  onClick={toggleVideoPlay}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
                
                {/* Glass morphism play overlay */}
                {!isVideoPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm cursor-pointer z-20"
                    onClick={toggleVideoPlay}
                  >
                    <div className="bg-white/90 backdrop-blur-md rounded-full p-6 shadow-2xl border border-white/20 hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 text-gray-900 ml-1" />
                    </div>
                  </div>
                )}

                {/* Glass morphism corner accents */}
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 z-30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-medium">Live Demo</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 z-30">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">SOAP Notes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tabs Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Streamline your workflow for faster pet care
              </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Medora AI is designed to save you time, money, and make your practice more efficient.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(features).map(([key, feature]) => (
              <button
                key={key}
                onClick={() => setActiveFeature(key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeFeature === key
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <feature.icon className={`w-5 h-5 inline mr-2 ${activeFeature === key ? 'text-white' : feature.iconColor}`} />
                {feature.title}
              </button>
                ))}
              </div>

          {/* Active Feature Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardContent className="p-12">
                <div className="flex items-start gap-6">
                  {(() => {
                    const active = features[activeFeature as keyof typeof features];
                    const FeatureIcon = active.icon;
                    return (
                      <div className={`w-16 h-16 ${active.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <FeatureIcon className={`w-8 h-8 ${active.iconColor}`} />
                      </div>
                    );
                  })()}
                      <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {features[activeFeature as keyof typeof features].title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {features[activeFeature as keyof typeof features].description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '30 hrs', label: 'Saved per month', icon: Clock },
              { value: '99.8%', label: 'Accuracy rate', icon: CheckCircle },
              { value: '1,000+', label: 'Veterinary clinics', icon: Users },
              { value: '300%', label: 'Average ROI', icon: TrendingUp }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-gray-600">{metric.label}</div>
                  </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Record Conversation',
                description: 'Start recording during patient consultation—our AI listens in real-time',
                icon: Mic
              },
              {
                step: '02',
                title: 'AI Transcribes & Structures',
                description: 'Advanced AI converts speech to structured SOAP format with veterinary accuracy',
                icon: Brain
              },
              {
                step: '03',
                title: 'Export & Sync',
                description: 'Download SOAP notes or sync directly with your EMR/VetQuRE system',
                icon: FileText
              }
            ].map((step, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-4">{step.step}</div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by veterinary professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what doctors and veterinarians are saying about Medora AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Medora AI saved me 6 hours a week—now I focus on diagnosis, not typing. The accuracy is incredible.",
                author: "Dr. Sreejith Kumar",
                title: "Veterinary Surgeon, Chennai",
                rating: 5
              },
              {
                quote: "Finally, a tool that understands veterinary medicine. It writes better SOAP notes than most humans.",
                author: "Dr. Priya Sharma",
                title: "Small Animal Practitioner, Mumbai",
                rating: 5
              },
              {
                quote: "The time savings are real. I can see 3 more pets per day without working longer hours.",
                author: "Dr. Rajesh Patel",
                title: "Mixed Practice Veterinarian, Delhi",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your practice?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 1,000+ veterinary clinics already saving time and increasing revenue with Medora AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartTrial}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              Start free trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              Book a demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • 14-day free trial • Setup in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Medora AI</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                The most trusted AI scribe in veterinary care. Turn your voice into perfect SOAP notes and focus on what matters—your pets.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-blue-600 text-white">Veterinary-Grade AI</Badge>
                <Badge className="bg-green-600 text-white">HIPAA Compliant</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#about" className="hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#resources" className="hover:text-gray-900 transition-colors">Resources</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Medora AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
