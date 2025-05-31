
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Brain, Video, Award, AlertCircle, ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Mock data - in real app this would come from Supabase
  const joinedClassrooms = [
    { id: '1', name: 'Computer Science 101', teacher: 'Dr. Smith', assignments: 3, code: 'CS101A' },
    { id: '2', name: 'Data Structures', teacher: 'Prof. Johnson', assignments: 2, code: 'DS2024' }
  ];

  const upcomingAssignments = [
    { id: '1', title: 'Process Scheduling Analysis', classroom: 'Operating Systems', dueDate: '2024-01-15', status: 'pending' },
    { id: '2', title: 'Binary Tree Implementation', classroom: 'Data Structures', dueDate: '2024-01-18', status: 'submitted' },
    { id: '3', title: 'Database Normalization', classroom: 'Database Systems', dueDate: '2024-01-20', status: 'pending' }
  ];

  const weakTopics = [
    { id: '1', topic: 'Process Synchronization', subject: 'Operating Systems', confidence: 40, recommendations: 8 },
    { id: '2', topic: 'Tree Traversal', subject: 'Data Structures', confidence: 65, recommendations: 5 },
    { id: '3', topic: 'SQL Joins', subject: 'Database Systems', confidence: 30, recommendations: 12 }
  ];

  const recentRecommendations = [
    { id: '1', type: 'video', title: 'Process Synchronization Explained', topic: 'Process Synchronization' },
    { id: '2', type: 'quiz', title: 'Tree Traversal Practice Quiz', topic: 'Tree Traversal' },
    { id: '3', type: 'resource', title: 'SQL Joins Tutorial', topic: 'SQL Joins' }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 50) return 'bg-red-500';
    if (confidence < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      case 'resource': return <BookOpen className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, Sarah!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Join Classroom
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => navigate('/learning-hub')}
            >
              <Brain className="h-4 w-4 mr-2" />
              Learning Hub
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Learning Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">8</div>
              <p className="text-sm text-gray-600 mt-1">3 pending, 5 completed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Weak Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-sm text-gray-600 mt-1">Need improvement</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">25</div>
              <p className="text-sm text-gray-600 mt-1">Personalized for you</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Classrooms */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Classrooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedClassrooms.map((classroom) => (
                  <Card 
                    key={classroom.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => navigate(`/classroom/${classroom.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{classroom.name}</CardTitle>
                      <CardDescription>
                        {classroom.teacher} • {classroom.assignments} assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {classroom.code}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Assignments</h2>
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{assignment.title}</div>
                        <Badge 
                          className={assignment.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{assignment.classroom}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {assignment.dueDate}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Weak Topics Analysis */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Topics to Improve</h2>
              <div className="space-y-4">
                {weakTopics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <div className="font-medium text-gray-900 mb-1">{topic.topic}</div>
                        <div className="text-sm text-gray-600">{topic.subject}</div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Confidence Level</span>
                          <span>{topic.confidence}%</span>
                        </div>
                        <Progress 
                          value={topic.confidence} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{topic.recommendations} recommendations</span>
                        <Button size="sm" variant="outline">
                          Study Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Recommendations */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">New Recommendations</h2>
              <div className="space-y-3">
                {recentRecommendations.map((rec) => (
                  <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {getTypeIcon(rec.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{rec.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{rec.topic}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
