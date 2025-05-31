
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Brain, Video, BookOpen, Award, Search, Play, ArrowLeft, MessageCircle, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearningHub = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for personalized recommendations
  const videoRecommendations = [
    {
      id: '1',
      title: 'Process Synchronization in Operating Systems',
      channel: 'CS Concepts',
      duration: '15:32',
      views: '125K',
      topic: 'Process Synchronization',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
      description: 'Complete guide to process synchronization with semaphores and monitors'
    },
    {
      id: '2',
      title: 'Binary Tree Traversal Methods Explained',
      channel: 'Data Structure Academy',
      duration: '12:45',
      views: '89K',
      topic: 'Tree Traversal',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      description: 'In-depth explanation of pre-order, in-order, and post-order traversal'
    },
    {
      id: '3',
      title: 'SQL Joins Masterclass',
      channel: 'Database Pro',
      duration: '18:21',
      views: '234K',
      topic: 'SQL Joins',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
      description: 'Master all types of SQL joins with practical examples'
    }
  ];

  const studyPlans = [
    {
      id: '1',
      topic: 'Process Synchronization',
      progress: 40,
      totalSteps: 8,
      completedSteps: 3,
      nextStep: 'Read about Semaphores',
      estimatedTime: '2 hours'
    },
    {
      id: '2',
      topic: 'Tree Traversal',
      progress: 75,
      totalSteps: 6,
      completedSteps: 4,
      nextStep: 'Practice traversal algorithms',
      estimatedTime: '1 hour'
    }
  ];

  const quizzes = [
    {
      id: '1',
      title: 'Process Synchronization Quiz',
      topic: 'Process Synchronization',
      questions: 10,
      difficulty: 'Medium',
      estimatedTime: '15 min',
      attempts: 0
    },
    {
      id: '2',
      title: 'Binary Tree Basics',
      topic: 'Tree Traversal',
      questions: 8,
      difficulty: 'Easy',
      estimatedTime: '12 min',
      attempts: 2
    },
    {
      id: '3',
      title: 'Advanced SQL Joins',
      topic: 'SQL Joins',
      questions: 15,
      difficulty: 'Hard',
      estimatedTime: '20 min',
      attempts: 1
    }
  ];

  const resources = [
    {
      id: '1',
      title: 'Operating Systems: Three Easy Pieces',
      type: 'Book',
      url: '#',
      topic: 'Process Synchronization',
      description: 'Comprehensive textbook chapter on synchronization'
    },
    {
      id: '2',
      title: 'GeeksforGeeks: Tree Traversal',
      type: 'Article',
      url: '#',
      topic: 'Tree Traversal',
      description: 'Detailed article with code examples'
    },
    {
      id: '3',
      title: 'W3Schools SQL Tutorial',
      type: 'Interactive',
      url: '#',
      topic: 'SQL Joins',
      description: 'Interactive SQL tutorial with examples'
    }
  ];

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoRecommendations.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <CardDescription>{video.channel} • {video.views} views</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {video.topic}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Q&A
                        </Button>
                        <Button size="sm" variant="outline">
                          <Languages className="h-4 w-4 mr-1" />
                          Translate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Study Plans Tab */}
          <TabsContent value="study-plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Personalized Study Plans</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Structured learning paths tailored to your identified weak topics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.topic}
                      <Badge variant="secondary">{plan.completedSteps}/{plan.totalSteps} steps</Badge>
                    </CardTitle>
                    <CardDescription>Estimated time: {plan.estimatedTime}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-2" />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">Next Step:</div>
                      <div className="text-sm text-blue-700">{plan.nextStep}</div>
                    </div>
                    <Button className="w-full">Continue Learning</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Practice Quizzes</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Test your knowledge with AI-generated quizzes based on your learning needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.questions} questions • {quiz.estimatedTime}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {quiz.topic}
                      </Badge>
                      <Badge 
                        className={
                          quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    {quiz.attempts > 0 && (
                      <div className="text-sm text-gray-600">
                        Previous attempts: {quiz.attempts}
                      </div>
                    )}
                    <Button className="w-full">
                      {quiz.attempts === 0 ? 'Start Quiz' : 'Retake Quiz'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Learning Resources</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Curated articles, books, and interactive content to deepen your understanding
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                      <Badge variant="outline">{resource.type}</Badge>
                    </div>
                    <CardDescription>Related to: {resource.topic}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
                    <Button className="w-full" variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Resource
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningHub;
