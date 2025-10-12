import { useState } from 'react';
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
  Cloud,
  Globe,
  Download,
  ChevronRight,
  Quote,
  CheckCircle,
  Volume2,
  PenTool,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LandingPage = () => {
  const navigate = useNavigate();
  const [doctorsCount, setDoctorsCount] = useState(1);

  const monthlySavings = doctorsCount * 20000;
  const hoursSaved = doctorsCount * 30;

  const handleStartTrial = () => {
    navigate('/dashboard');
  };

  const handleWatchDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-40 right-40 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Content */}
            <div className="text-white">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Trusted by 1,000+ Veterinary Clinics</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                Focus on Caring,
                <br />
                <span className="bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Not Typing
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Let AI handle your documentation while you focus on what you do best—caring for your patients. VoiceScribe.AI transforms your conversations into perfect SOAP notes instantly.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">30</div>
                  <div className="text-blue-100 text-sm">Hours Saved/Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">99.8%</div>
                  <div className="text-blue-100 text-sm">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">₹20K</div>
                  <div className="text-blue-100 text-sm">Extra Revenue</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
              <Button
                onClick={handleWatchDemo}
                variant="outline"
                size="lg"
                className="border-white text-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Patient-Focused Care</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Veterinary-Specific AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Start Free Today</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-6">
                {/* Professional Doctor Image */}
                <div className="w-full h-[500px] rounded-xl overflow-hidden relative">
                  <img 
                    src="/assets/images/veterinarian-check-ing-puppy-s-health.jpg"
                    alt="Veterinarian checking puppy's health with stethoscope in modern clinic"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                  {/* AI Status Indicators */}
                  {/* Writing Status */}
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm border-2 border-green-300 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <PenTool className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">Writing...</span>
                  </div>

                  {/* Listening Status */}
                  <div className="absolute top-20 right-6 bg-white/95 backdrop-blur-sm border-2 border-red-300 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Volume2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">Listening...</span>
                  </div>

                  {/* Success Checkmark */}
                  <div className="absolute top-12 left-6 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>

                  {/* Bottom overlay for stats */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent p-6">
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">1,247</div>
                        <div className="text-sm text-gray-600">Records Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">8,432</div>
                        <div className="text-sm text-gray-600">Hours Saved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">99.8%</div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Cards - Repositioned */}
                {/* Records Completed */}
                <div className="absolute -top-3 -left-3 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-800">Records</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">1,247</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">+18%</span>
                  </div>
                </div>

                {/* Hours Saved */}
                <div className="absolute -bottom-3 -right-3 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-800">Hours</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">8,432</div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">+24%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Problem Side */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Love Your Patients,
                <br />
                <span className="text-red-500">Hate the Paperwork?</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You became a veterinarian to care for animals, not to spend hours typing notes. Let AI handle the documentation while you focus on what you love.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Clock,
                    title: "Less Time with Patients",
                    description: "40% of your consultation time is spent on paperwork instead of caring",
                    color: "text-red-500",
                    bgColor: "bg-red-50"
                  },
                  {
                    icon: Heart,
                    title: "Missing the Joy",
                    description: "Paperwork steals the satisfaction of helping animals and their families",
                    color: "text-orange-500",
                    bgColor: "bg-orange-50"
                  },
                  {
                    icon: DollarSign,
                    title: "Fewer Patients Helped",
                    description: "Admin work limits how many pets you can care for each day",
                    color: "text-purple-500",
                    bgColor: "bg-purple-50"
                  }
                ].map((pain, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${pain.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <pain.icon className={`w-6 h-6 ${pain.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{pain.title}</h3>
                      <p className="text-gray-600">{pain.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution Side */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Get Back to What You Love
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: Mic,
                      title: "Just Talk & Care",
                      description: "Speak naturally while examining pets - AI handles the notes",
                      color: "text-blue-600"
                    },
                    {
                      icon: Heart,
                      title: "More Patient Time",
                      description: "Focus on the animals while AI documents everything",
                      color: "text-green-600"
                    },
                    {
                      icon: FileText,
                      title: "Perfect Records",
                      description: "Accurate SOAP notes without the typing stress",
                      color: "text-purple-600"
                    }
                  ].map((solution, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <solution.icon className={`w-6 h-6 ${solution.color}`} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{solution.title}</h4>
                        <p className="text-gray-600">{solution.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">30 Hours</div>
                    <div className="text-gray-600">More Time with Your Patients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for Veterinary Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature designed specifically for veterinary practices and medical professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Real-time Voice Transcription",
                description: "Advanced speech recognition with 99.8% accuracy for medical terminology",
                color: "text-blue-600",
                bgColor: "bg-blue-50"
              },
              {
                icon: Pill,
                title: "Medical Drug Dictionary",
                description: "RAG-powered AI with comprehensive veterinary and human medicine database",
                color: "text-green-600",
                bgColor: "bg-green-50"
              },
              {
                icon: FileText,
                title: "Auto-generated Prescriptions",
                description: "Complete prescriptions with dosage, frequency, and follow-up plans",
                color: "text-purple-600",
                bgColor: "bg-purple-50"
              },
              {
                icon: Cloud,
                title: "Secure Cloud Storage",
                description: "HIPAA-compliant with enterprise-grade security and automatic backup",
                color: "text-indigo-600",
                bgColor: "bg-indigo-50"
              },
              {
                icon: Globe,
                title: "Multilingual Support",
                description: "English, Hindi, Malayalam, Tamil - speak in your preferred language",
                color: "text-orange-600",
                bgColor: "bg-orange-50"
              },
              {
                icon: Shield,
                title: "Medical-Grade Security",
                description: "End-to-end encryption and compliance with healthcare data standards",
                color: "text-red-600",
                bgColor: "bg-red-50"
              }
            ].map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How VoiceScribe.AI Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Mic,
                title: "Record Conversation",
                description: "Start recording during patient consultation - our AI listens in real-time",
                color: "blue"
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Transcribes & Structures",
                description: "Advanced AI converts speech to structured SOAP format with medical accuracy",
                color: "green"
              },
              {
                step: "03",
                icon: Download,
                title: "Export & Sync",
                description: "Download SOAP notes or sync directly with your EMR/VetQuRE system",
                color: "purple"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full text-center p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className={`w-20 h-20 bg-${step.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <step.icon className={`w-10 h-10 text-${step.color}-600`} />
                  </div>
                  <div className={`text-4xl font-bold text-${step.color}-600 mb-4`}>{step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              onClick={handleStartTrial}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
            >
              Try Live Demo
              <Play className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Veterinary Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what doctors and veterinarians are saying about VoiceScribe.AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "VoiceScribe saved me 6 hours a week — now I focus on diagnosis, not typing. The accuracy is incredible.",
                author: "Dr. Sreejith Kumar",
                title: "Veterinary Surgeon, Chennai",
                rating: 5,
                avatar: "👨‍⚕️"
              },
              {
                quote: "Finally, a tool that understands veterinary medicine. It writes better SOAP notes than most humans.",
                author: "Dr. Priya Sharma",
                title: "Small Animal Practitioner, Mumbai",
                rating: 5,
                avatar: "👩‍⚕️"
              },
              {
                quote: "The time savings are real. I can see 3 more patients per day without working longer hours.",
                author: "Dr. Rajesh Patel",
                title: "Mixed Practice Veterinarian, Delhi",
                rating: 5,
                avatar: "👨‍⚕️"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="h-full p-8 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="text-center">
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <Quote className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Calculate Your Savings
            </h2>
            <p className="text-xl text-gray-600">
              See how much time and money VoiceScribe.AI can save your clinic
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="doctors" className="text-lg font-semibold text-gray-900 mb-4 block">
                  Number of Doctors in Your Clinic
                </Label>
                <Input
                  id="doctors"
                  type="number"
                  min="1"
                  value={doctorsCount}
                  onChange={(e) => setDoctorsCount(parseInt(e.target.value) || 1)}
                  className="text-2xl font-bold text-center py-4"
                />
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ₹{monthlySavings.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Additional Monthly Revenue</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {hoursSaved}
                  </div>
                  <div className="text-gray-600">Hours Saved Per Month</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button
                onClick={handleStartTrial}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 1,000+ veterinary clinics already saving time and increasing revenue with VoiceScribe.AI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={handleStartTrial}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleWatchDemo}
              variant="outline"
              size="lg"
              className="border-white text-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm text-blue-200">
            No credit card required • 14-day free trial • Setup in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">VoiceScribe.AI</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                The most trusted AI scribe in veterinary care. Turn your voice into perfect SOAP notes and focus on what matters—your patients.
              </p>
              <div className="flex gap-4">
                <Badge className="bg-blue-600 text-white">Medical-Grade AI</Badge>
                <Badge className="bg-green-600 text-white">HIPAA Compliant</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VoiceScribe.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
