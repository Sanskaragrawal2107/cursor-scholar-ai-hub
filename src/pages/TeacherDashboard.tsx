
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);

  // Mock data - in real app this would come from Supabase
  const classrooms = [
    { id: '1', name: 'Computer Science 101', students: 28, assignments: 5, code: 'CS101A' },
    { id: '2', name: 'Data Structures', students: 22, assignments: 3, code: 'DS2024' },
    { id: '3', name: 'Operating Systems', students: 31, assignments: 7, code: 'OS101B' }
  ];

  const recentSubmissions = [
    { id: '1', student: 'Alice Johnson', assignment: 'Process Scheduling', status: 'analyzing', timestamp: '2 hours ago' },
    { id: '2', student: 'Bob Smith', assignment: 'Binary Trees', status: 'completed', timestamp: '5 hours ago' },
    { id: '3', student: 'Carol Davis', assignment: 'Memory Management', status: 'weak_topics_found', timestamp: '1 day ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'weak_topics_found': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, Dr. Professor</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              New Classroom
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">81</div>
              <p className="text-sm text-gray-600 mt-1">Across 3 classrooms</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">15</div>
              <p className="text-sm text-gray-600 mt-1">Waiting for submissions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                AI Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">47</div>
              <p className="text-sm text-gray-600 mt-1">Completed this week</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Students Helped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">23</div>
              <p className="text-sm text-gray-600 mt-1">Received recommendations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Classrooms */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Classrooms</h2>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Classroom
              </Button>
            </div>

            <div className="space-y-4">
              {classrooms.map((classroom) => (
                <Card 
                  key={classroom.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => navigate(`/classroom/${classroom.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{classroom.name}</CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {classroom.code}
                      </Badge>
                    </div>
                    <CardDescription>
                      {classroom.students} students • {classroom.assignments} assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Last updated: 2 hours ago</span>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{submission.student}</div>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{submission.assignment}</div>
                    <div className="text-xs text-gray-500">{submission.timestamp}</div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">AI Analysis in Progress</div>
                  <div className="text-sm text-gray-400">3 submissions being analyzed...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
