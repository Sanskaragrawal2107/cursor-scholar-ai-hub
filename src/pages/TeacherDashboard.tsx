import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, BarChart3, Settings, ArrowLeft, Eye, FileText, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  getClassrooms, 
  createClassroom, 
  getTeacherRecentSubmissions,
  getTotalStudentCount,
  getTeacherAssignments,
  getTeacherWeakTopicsCount,
  getTeacherRecommendationsCount,
  triggerSubmissionAnalysis
} from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  class_code: string;
  created_at: string;
}

interface Submission {
  id: string;
  student_id: string;
  assignment_id: string;
  submitted_at: string;
  ai_analysis_status: string;
  file_url?: string | null;
  file_path?: string | null;
  content_text?: string | null;
  ai_feedback?: any;
  assignments: {
    title: string;
    id: string;
    file_url?: string | null;
    file_path?: string | null;
  };
  users: {
    id: string;
    full_name: string | null;
    email: string | null;
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
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
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

  // Handle AI analysis of submission PDFs
  const handleAnalyzeSubmission = async (submissionId: string) => {
    try {
      setAnalyzing(prev => ({ ...prev, [submissionId]: true }));
      
      toast({
        title: 'Analysis Started',
        description: 'The submission is being analyzed by AI'
      });
      
      await triggerSubmissionAnalysis(submissionId);
      
      // Create a polling interval to refresh status
      const intervalId = setInterval(async () => {
        if (user) {
          // Check submission status
          try {
            const { data } = await supabase
              .from('submissions')
              .select('ai_analysis_status')
              .eq('id', submissionId)
              .single();
              
            // If status is no longer processing, stop polling and refresh submission list
            if (data && data.ai_analysis_status !== 'processing') {
              clearInterval(intervalId);
              
              // Refresh submission data
              const submissions = await getTeacherRecentSubmissions(user.id);
              setRecentSubmissions(submissions);
              
              // Show toast based on status
              if (data.ai_analysis_status === 'completed') {
                toast({
                  title: 'Analysis Complete',
                  description: 'The PDFs have been analyzed successfully',
                  variant: 'default'
                });
              } else if (data.ai_analysis_status === 'failed') {
                toast({
                  title: 'Analysis Failed',
                  description: 'There was an issue analyzing the submission',
                  variant: 'destructive'
                });
              }
              
              setAnalyzing(prev => ({ ...prev, [submissionId]: false }));
            }
          } catch (error) {
            console.error('Error checking submission status:', error);
          }
        }
      }, 3000); // Check every 3 seconds
      
      // Stop polling after 60 seconds regardless of status
      setTimeout(() => {
        clearInterval(intervalId);
        setAnalyzing(prev => ({ ...prev, [submissionId]: false }));
        
        // Final refresh of submission data
        if (user) {
          getTeacherRecentSubmissions(user.id).then(submissions => {
            setRecentSubmissions(submissions);
          });
        }
      }, 60000); // 60 seconds timeout
      
    } catch (error) {
      console.error('Error analyzing submission:', error);
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing the submission',
        variant: 'destructive'
      });
      setAnalyzing(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
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
                      placeholder="Provide a brief description of this classroom"
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
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : studentCount}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Across all classrooms
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : assignmentCount}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                Active assignments
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weak Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : weakTopicsCount}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                Identified by AI
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : recommendationsCount}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                Generated for students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Classrooms */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Classrooms</h2>
              {loading ? (
                <div className="text-center py-12">Loading classrooms...</div>
              ) : classrooms.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Classrooms Yet</h3>
                    <p className="text-gray-500 mb-4">Create your first classroom to get started</p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Classroom
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classrooms.map(classroom => (
                    <Card 
                      key={classroom.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/classroom/${classroom.id}`)}
                    >
                      <CardHeader>
                        <CardTitle>{classroom.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <span>Code: </span>
                          <Badge variant="secondary" className="ml-1">{classroom.class_code}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {classroom.description || 'No description provided'}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Created {new Date(classroom.created_at).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Card className="border-dashed border-2 border-gray-200 flex items-center justify-center hover:shadow-sm cursor-pointer" onClick={() => setCreateDialogOpen(true)}>
                    <CardContent className="p-6 text-center flex flex-col items-center space-y-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Plus className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-gray-600">Create New Classroom</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h2>
              {loading ? (
                <div className="text-center py-8">Loading submissions...</div>
              ) : recentSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No submissions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {recentSubmissions.map(submission => (
                        <div key={submission.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{submission.users?.full_name || 'Anonymous Student'}</div>
                              <div className="text-sm text-gray-600">
                                {submission.assignments?.title || 'Unknown Assignment'}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(submission.ai_analysis_status)}>
                                {submission.ai_analysis_status.replace('_', ' ')}
                              </Badge>
                              {submission.ai_feedback && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  Feedback Available
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Submitted {getRelativeTime(submission.submitted_at)}
                            </div>
                            <div className="flex gap-2">
                              {/* AI Analysis button */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeSubmission(submission.id);
                                }}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                {analyzing[submission.id] ? 'Analyzing...' : 'Analyse with AI'}
                              </Button>
                              
                              {/* View Assignment button */}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (submission.assignments?.id) {
                                    navigate(`/assignment/${submission.assignments.id}`);
                                  }
                                }}
                              >
                                View Assignment
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats and Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Classroom
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled={classrooms.length === 0} onClick={() => {
                  if (classrooms.length > 0) {
                    navigate(`/classroom/${classrooms[0].id}`);
                  }
                }}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Assignments
                </Button>
              </CardContent>
            </Card>

            {/* Tips for Teachers */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
              <CardHeader>
                <CardTitle className="text-blue-800">Tips for Teachers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div className="space-y-2">
                  <h3 className="font-medium">Create engaging assignments</h3>
                  <p className="text-sm">Upload PDF assignments with clear instructions and learning objectives.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Review AI analysis</h3>
                  <p className="text-sm">Leverage our AI to identify weak topics and provide targeted help to students.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Track student progress</h3>
                  <p className="text-sm">Monitor submissions and review personalized recommendations for each student.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
