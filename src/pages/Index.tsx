import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GraduationCap, Users, BookOpen, Brain, Video, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { user, userMetadata, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  
  const handleRoleSelect = (selectedRole: 'teacher' | 'student') => {
    if (user) {
      // If user is already authenticated, navigate directly
      if (selectedRole === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } else {
      // Set the role for registration and open auth dialog
      setRole(selectedRole);
      setAuthDialogOpen(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setAuthDialogOpen(false);
      
      // Navigation is handled in the auth context after successful sign-in
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, fullName, role);
      toast({
        title: 'Registration successful!',
        description: 'Please check your email to verify your account.',
      });
      setAuthDialogOpen(false);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };
  
  // If user is already logged in, redirect based on role
  if (user && userMetadata?.role) {
    if (userMetadata.role === 'teacher') {
      navigate('/teacher-dashboard');
    } else if (userMetadata.role === 'student') {
      navigate('/student-dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Learning Platform
              </h1>
              <p className="text-sm text-gray-600">Personalized education powered by AI</p>
            </div>
          </div>
          <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-blue-50">
                {user ? 'Dashboard' : 'Sign In'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Authentication</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input 
                        id="signin-email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input 
                        id="signin-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full">Sign In</Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input 
                        id="signup-name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <RadioGroup 
                        value={role} 
                        onValueChange={(val) => setRole(val as 'student' | 'teacher')}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="student" id="student" />
                          <Label htmlFor="student">Student</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="teacher" id="teacher" />
                          <Label htmlFor="teacher">Teacher</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button type="submit" className="w-full">Sign Up</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
            Transform Learning with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Education
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in">
            Our platform analyzes student submissions, identifies learning gaps, and provides personalized resources including videos, study plans, and interactive quizzes.
          </p>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
            <Card 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-blue-300 animate-fade-in"
              onClick={() => handleRoleSelect('teacher')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Teacher</CardTitle>
                <CardDescription className="text-gray-600">
                  Create classrooms, manage assignments, and track student progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center"><Users className="h-4 w-4 mr-2 text-blue-500" />Manage multiple classrooms</li>
                  <li className="flex items-center"><BookOpen className="h-4 w-4 mr-2 text-blue-500" />Create & distribute assignments</li>
                  <li className="flex items-center"><Brain className="h-4 w-4 mr-2 text-blue-500" />AI-powered student insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-purple-300 animate-fade-in"
              onClick={() => handleRoleSelect('student')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Student</CardTitle>
                <CardDescription className="text-gray-600">
                  Join classrooms, submit assignments, and get personalized learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center"><Video className="h-4 w-4 mr-2 text-purple-500" />Personalized video recommendations</li>
                  <li className="flex items-center"><Award className="h-4 w-4 mr-2 text-purple-500" />Interactive quizzes & study plans</li>
                  <li className="flex items-center"><Brain className="h-4 w-4 mr-2 text-purple-500" />AI identifies learning gaps</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powered by Advanced AI Technology
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Smart Analysis</h4>
              <p className="text-gray-600">AI analyzes student submissions to identify weak topics and learning gaps automatically.</p>
            </div>
            
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Video Integration</h4>
              <p className="text-gray-600">Multi-language video transcripts, summaries, and interactive Q&A capabilities.</p>
            </div>
            
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Personalized Learning</h4>
              <p className="text-gray-600">Custom study plans, resource recommendations, and adaptive quizzes for each student.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Education?</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our AI-powered education platform connects teachers and students for personalized learning experiences.
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => setAuthDialogOpen(true)}
          >
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
