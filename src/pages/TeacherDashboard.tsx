import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  getClassrooms, 
  createClassroom, 
  getTeacherRecentSubmissions,
  getTotalStudentCount,
  getTeacherAssignments,
  getTeacherWeakTopicsCount,
  getTeacherRecommendationsCount
} from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  class_code: string;
  created_at: string;
}

interface Submission {
  id: string;
  submitted_at: string;
  ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  assignments: {
    title: string;
  };
  users: {
    full_name: string | null;
  };
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, userMetadata } = useAuth();
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [assignmentCount, setAssignmentCount] = useState<number>(0);
  const [weakTopicsCount, setWeakTopicsCount] = useState<number>(0);
  const [recommendationsCount, setRecommendationsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newClassroomDescription, setNewClassroomDescription] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get classrooms
        const teacherClassrooms = await getClassrooms(user.id);
        setClassrooms(teacherClassrooms);
        
        // Get stats
        const studentsCount = await getTotalStudentCount(user.id);
        setStudentCount(studentsCount);
        
        const assignments = await getTeacherAssignments(user.id);
        setAssignmentCount(assignments.length);
        
        const weakTopics = await getTeacherWeakTopicsCount(user.id);
        setWeakTopicsCount(weakTopics);
        
        const recommendations = await getTeacherRecommendationsCount(user.id);
        setRecommendationsCount(recommendations);
        
        // Get recent submissions
        const submissions = await getTeacherRecentSubmissions(user.id);
        setRecentSubmissions(submissions);
      } catch (error) {
        console.error('Error loading teacher data:', error);
        toast({
          title: 'Failed to load data',
          description: 'There was an error loading your dashboard data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, toast]);

  // Handle classroom creation
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const newClassroom = await createClassroom(
        newClassroomName,
        newClassroomDescription,
        user.id
      );
      
      setClassrooms([...classrooms, newClassroom]);
      setNewClassroomName('');
      setNewClassroomDescription('');
      setCreateDialogOpen(false);
      
      toast({
        title: 'Classroom created',
        description: `${newClassroomName} has been created successfully`
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: 'Failed to create classroom',
        description: 'There was an error creating your classroom',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date relative to now
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Redirect if not a teacher
  if (user && userMetadata?.role !== 'teacher') {
    navigate('/');
    return null;
  }

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
              <p className="text-sm text-gray-600">Welcome back, {userMetadata?.full_name || 'Teacher'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Classroom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Classroom</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClassroom} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="classroom-name">Classroom Name</Label>
                    <Input 
                      id="classroom-name" 
                      value={newClassroomName}
                      onChange={(e) => setNewClassroomName(e.target.value)}
                      placeholder="e.g. Computer Science 101"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classroom-description">Description (Optional)</Label>
                    <Textarea 
                      id="classroom-description" 
                      value={newClassroomDescription}
                      onChange={(e) => setNewClassroomDescription(e.target.value)}
                      placeholder="Brief description of the classroom"
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Classroom</Button>
                </form>
              </DialogContent>
            </Dialog>
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
              <div className="text-3xl font-bold text-blue-600">
                {loading ? '...' : studentCount}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Across {classrooms.length} classroom{classrooms.length !== 1 ? 's' : ''}
              </p>
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
              <div className="text-3xl font-bold text-green-600">
                {loading ? '...' : assignmentCount}
              </div>
              <p className="text-sm text-gray-600 mt-1">Across all classrooms</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Weak Topics Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {loading ? '...' : weakTopicsCount}
              </div>
              <p className="text-sm text-gray-600 mt-1">By AI analysis</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {loading ? '...' : recommendationsCount}
              </div>
              <p className="text-sm text-gray-600 mt-1">For students</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Classrooms */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Classrooms</h2>
              <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Classroom
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading classrooms...</div>
            ) : classrooms.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No classrooms yet</div>
                  <div className="text-sm text-gray-400 mb-4">Create your first classroom to get started</div>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Classroom
                  </Button>
                </CardContent>
              </Card>
            ) : (
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
                          {classroom.class_code}
                        </Badge>
                      </div>
                      <CardDescription>
                        {classroom.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Created: {new Date(classroom.created_at).toLocaleDateString()}</span>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading submissions...</div>
            ) : classrooms.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No submissions yet</div>
                  <div className="text-sm text-gray-400">Create a classroom and assign work to see submissions</div>
                </CardContent>
              </Card>
            ) : recentSubmissions.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No submissions yet</div>
                  <div className="text-sm text-gray-400">Students haven't submitted any assignments yet</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {submission.users?.full_name || 'Anonymous Student'}
                        </div>
                        <Badge className={getStatusColor(submission.ai_analysis_status)}>
                          {submission.ai_analysis_status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {submission.assignments?.title || 'Unknown Assignment'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getRelativeTime(submission.submitted_at)}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {recentSubmissions.some(s => s.ai_analysis_status === 'processing') && (
                  <Card className="border-dashed border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="text-gray-500 mb-2">AI Analysis in Progress</div>
                      <div className="text-sm text-gray-400">
                        {recentSubmissions.filter(s => s.ai_analysis_status === 'processing').length} submission(s) being analyzed...
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
