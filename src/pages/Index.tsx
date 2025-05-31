
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Brain, Video, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    // In a real app, this would handle authentication flow
    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

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
          <Button variant="outline" className="hover:bg-blue-50">
            Sign In
          </Button>
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
            Connect with Supabase to unlock authentication, database storage, and full AI-powered features.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-blue-800 mb-4 font-medium">
              🚀 To enable backend functionality (authentication, file storage, AI analysis), click the green Supabase button in the top right to connect your database.
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
