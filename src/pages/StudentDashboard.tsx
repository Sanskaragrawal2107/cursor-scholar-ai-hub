import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Brain, Video, Award, AlertCircle, ArrowLeft, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getClassroomsByStudent, getStudentAssignments, getStudentWeakTopics, getPersonalizedRecommendations, joinClassroom } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string;
  class_code: string;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  classrooms: { name: string; id: string } | null;
}

interface WeakTopic {
  id: string;
  topic_name: string;
  confidence_score: number | null;
  assignments: { title: string } | null;
}

interface Recommendation {
  id: string;
  recommendation_type: 'youtube_video' | 'resource_link' | 'study_plan_item' | 'quiz';
  title: string;
  student_weak_topics: { topic_name: string } | null;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, userMetadata } = useAuth();
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [classCode, setClassCode] = useState('');

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get classrooms
        const studentClassrooms = await getClassroomsByStudent(user.id);
        setClassrooms(studentClassrooms);
        
        // Get assignments
        const studentAssignments = await getStudentAssignments(user.id);
        setAssignments(studentAssignments);
        
        // Get weak topics
        const topics = await getStudentWeakTopics(user.id);
        setWeakTopics(topics);
        
        // Get recommendations
        const recs = await getPersonalizedRecommendations(user.id);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading student data:', error);
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

  // Handle joining a classroom
  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await joinClassroom(classCode, user.id);
      
      // Refresh classrooms
      const updatedClassrooms = await getClassroomsByStudent(user.id);
      setClassrooms(updatedClassrooms);
      
      setClassCode('');
      setJoinDialogOpen(false);
      
      toast({
        title: 'Classroom joined',
        description: 'You have successfully joined the classroom'
      });
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      toast({
        title: 'Failed to join classroom',
        description: error.message || 'There was an error joining the classroom',
        variant: 'destructive'
      });
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'bg-gray-500';
    if (confidence < 50) return 'bg-red-500';
    if (confidence < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube_video': return <Video className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      case 'resource_link': return <BookOpen className="h-4 w-4" />;
      case 'study_plan_item': return <Brain className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const isDueSoon = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  // Redirect if not a student
  if (user && userMetadata?.role !== 'student') {
    navigate('/');
    return null;
  }

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
              <p className="text-sm text-gray-600">Welcome back, {userMetadata?.full_name || 'Student'}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Join Classroom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Classroom</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinClassroom} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-code">Class Code</Label>
                    <Input 
                      id="class-code" 
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ABC123"
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full">Join Classroom</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
              onClick={() => navigate('/study-roadmap')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Study Roadmap
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
              <div className="text-3xl font-bold text-purple-600">
                {loading ? '...' : assignments.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Loading...' : `${assignments.length} total assignments`}
              </p>
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
              <div className="text-3xl font-bold text-red-600">
                {loading ? '...' : weakTopics.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Loading...' : weakTopics.length === 0 
                  ? 'No weak topics identified yet' 
                  : `${weakTopics.length} topics need attention`
                }
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loading ? '...' : recommendations.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Loading...' : recommendations.length === 0
                  ? 'No personalized resources yet'
                  : `${recommendations.length} recommended resources`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (span 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-600" />
                  Recommendations
                </CardTitle>
                <CardDescription>Resources curated based on your needs</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-4 text-center text-gray-500">Loading recommendations...</div>
                ) : recommendations.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    <p>No recommendations yet</p>
                    <p className="text-xs mt-1">Submit assignments to get personalized recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.slice(0, 5).map(rec => (
                      <div key={rec.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                        <div className="bg-gray-100 p-2 rounded-md text-purple-600">
                          {getTypeIcon(rec.recommendation_type)}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium">{rec.title}</h4>
                          {rec.student_weak_topics && (
                            <p className="text-xs text-gray-600">{rec.student_weak_topics.topic_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {recommendations.length > 5 && (
                      <Button variant="ghost" className="w-full text-sm mt-2" onClick={() => navigate('/learning-hub')}>
                        View All {recommendations.length} Resources
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Classrooms */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Classrooms</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading classrooms...</div>
              ) : classrooms.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-500 mb-2">No classrooms joined yet</div>
                    <div className="text-sm text-gray-400 mb-4">Join a classroom to see assignments and resources</div>
                    <Button onClick={() => setJoinDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Join Classroom
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classrooms.map((classroom) => (
                    <Card 
                      key={classroom.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => navigate(`/classroom/${classroom.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{classroom.name}</CardTitle>
                        <CardDescription>
                          {classroom.description || 'No description provided'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {classroom.class_code}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Assignments */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Assignments</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading assignments...</div>
              ) : assignments.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-500 mb-2">No assignments yet</div>
                    <div className="text-sm text-gray-400">Join classrooms to see assignments</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{assignment.title}</div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            pending
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{assignment.classrooms?.name || 'Unknown classroom'}</div>
                        {assignment.due_date && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Weak Topics Analysis */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Topics to Improve</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading topics...</div>
              ) : weakTopics.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-500 mb-2">No weak topics identified yet</div>
                    <div className="text-sm text-gray-400">Submit assignments to get AI analysis</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {weakTopics.map((topic) => (
                    <Card key={topic.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <div className="font-medium text-gray-900 mb-1">{topic.topic_name}</div>
                          <div className="text-sm text-gray-600">{topic.assignments?.title || 'Unknown assignment'}</div>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Confidence Level</span>
                            <span>{topic.confidence_score || 0}%</span>
                          </div>
                          <Progress 
                            value={topic.confidence_score || 0} 
                            className="h-2"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Needs improvement</span>
                          <Button size="sm" variant="outline">
                            Study Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Recommendations */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">New Recommendations</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading recommendations...</div>
              ) : recommendations.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-500 mb-2">No recommendations yet</div>
                    <div className="text-sm text-gray-400">Submit assignments to get personalized recommendations</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            {getTypeIcon(rec.recommendation_type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{rec.title}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {rec.student_weak_topics?.topic_name || 'General recommendation'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
