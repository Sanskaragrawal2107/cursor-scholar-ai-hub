import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Brain, Video, BookOpen, Award, Search, Play, ArrowLeft, MessageCircle, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { 
  getVideoRecommendations, 
  getStudyPlans, 
  getQuizzes, 
  getLearningResources, 
  getStudentWeakTopics 
} from '@/lib/api';

interface VideoRecommendation {
  id: string;
  title: string;
  description: string;
  topic: string;
  thumbnail: string;
  url: string;
  details: any;
}

interface StudyPlan {
  id: string;
  title: string;
  topic: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  nextStep: string;
  estimatedTime: string;
}

interface Quiz {
  id: string;
  title: string;
  topic: string;
  questions: number;
  difficulty: string;
  estimatedTime: string;
  attempts: number;
}

interface Resource {
  id: string;
  title: string;
  topic: string;
  type: string;
  url: string;
  description: string;
}

const LearningHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoRecommendations, setVideoRecommendations] = useState<VideoRecommendation[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get video recommendations
        const videos = await getVideoRecommendations(user.id);
        setVideoRecommendations(videos);
        
        // Get study plans
        const plans = await getStudyPlans(user.id);
        setStudyPlans(plans);
        
        // Get quizzes
        const quizData = await getQuizzes(user.id);
        setQuizzes(quizData);
        
        // Get resources
        const resourcesData = await getLearningResources(user.id);
        setResources(resourcesData);
      } catch (error) {
        console.error('Error loading learning data:', error);
        toast({
          title: 'Failed to load data',
          description: 'There was an error loading your learning resources',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, toast]);

  // Filter resources based on search query
  const filteredVideos = searchQuery
    ? videoRecommendations.filter(
        video => video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        video.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videoRecommendations;

  const filteredStudyPlans = searchQuery
    ? studyPlans.filter(
        plan => plan.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : studyPlans;

  const filteredQuizzes = searchQuery
    ? quizzes.filter(
        quiz => quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        quiz.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quizzes;

  const filteredResources = searchQuery
    ? resources.filter(
        resource => resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources;

  // Redirect if not logged in or not a student
  if (!user) {
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
              onClick={() => navigate('/student-dashboard')}
              className="hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Learning Hub
              </h1>
              <p className="text-sm text-gray-600">Personalized resources for your learning journey</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="study-plans" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Study Plans</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Videos</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                AI-curated video content based on your weak topics and learning patterns
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading video recommendations...</div>
            ) : filteredVideos.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No video recommendations yet</div>
                  <div className="text-sm text-gray-400">
                    {searchQuery ? 'No videos match your search query' : 'Submit assignments to get personalized video recommendations'}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-40 object-cover rounded-t-lg" 
                      />
                      <Button 
                        size="icon" 
                        className="absolute inset-0 m-auto bg-purple-600 hover:bg-purple-700 rounded-full w-12 h-12 opacity-80"
                        onClick={() => setSelectedVideo(video.id)}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                      <Badge className="absolute top-2 right-2 bg-blue-600">{video.topic}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Study Plans Tab */}
          <TabsContent value="study-plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Personalized Study Plans</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Step-by-step learning paths tailored to help you improve on specific topics
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading study plans...</div>
            ) : filteredStudyPlans.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No study plans available yet</div>
                  <div className="text-sm text-gray-400">
                    {searchQuery ? 'No study plans match your search query' : 'Complete assignments to get personalized study plans'}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredStudyPlans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2 bg-purple-100 text-purple-800">{plan.topic}</Badge>
                          <CardTitle className="text-xl">{plan.title || 'Study Plan'}</CardTitle>
                          <CardDescription>Progress: {plan.completedSteps}/{plan.totalSteps} steps completed</CardDescription>
                        </div>
                        <Badge variant="outline">{plan.estimatedTime}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-medium">{Math.round(plan.progress)}%</span>
                        </div>
                        <Progress value={plan.progress} className="h-2" />
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Next Step:</h4>
                        <p className="text-sm text-blue-700">{plan.nextStep}</p>
                      </div>
                      <Button className="w-full">Continue Learning</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Practice Quizzes</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Test your knowledge with adaptive quizzes focused on strengthening your weak areas
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading quizzes...</div>
            ) : filteredQuizzes.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No quizzes available yet</div>
                  <div className="text-sm text-gray-400">
                    {searchQuery ? 'No quizzes match your search query' : 'Complete assignments to get recommended quizzes'}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardHeader className="pb-3">
                      <Badge className="mb-2 bg-blue-100 text-blue-800">{quiz.topic}</Badge>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>
                        {quiz.questions} questions • {quiz.estimatedTime}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className={
                          quiz.difficulty === 'Easy' ? 'border-green-200 text-green-800' :
                          quiz.difficulty === 'Medium' ? 'border-yellow-200 text-yellow-800' :
                          'border-red-200 text-red-800'
                        }>
                          {quiz.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {quiz.attempts} {quiz.attempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      </div>
                      <Button className="w-full">Start Quiz</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Learning Resources</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Curated articles, books, and interactive tutorials to help deepen your understanding
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading resources...</div>
            ) : filteredResources.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No resources available yet</div>
                  <div className="text-sm text-gray-400">
                    {searchQuery ? 'No resources match your search query' : 'Complete assignments to get recommended resources'}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="bg-purple-100 text-purple-800">{resource.topic}</Badge>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                      <Button className="w-full" variant="outline" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Resource
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningHub;
