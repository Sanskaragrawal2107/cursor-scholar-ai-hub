import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle,
  ArrowRight,
  PlayCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Quiz modal component to display interactive quiz
const QuizModal = ({ isOpen, setIsOpen, quiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Generate questions based on quiz topic
  const quizQuestions = React.useMemo(() => {
    if (!quiz) return [];

    // Generate questions based on topic
    if (quiz.topic === "CPU Scheduling") {
      return [
        {
          question: "Which scheduling algorithm is non-preemptive?",
          options: ["Round Robin", "Shortest Job First", "Priority Scheduling", "All of the above"],
          correctAnswer: "Shortest Job First"
        },
        {
          question: "Which scheduling algorithm is best for time-sharing systems?",
          options: ["FCFS", "Round Robin", "SJF", "Priority Scheduling"],
          correctAnswer: "Round Robin"
        },
        {
          question: "What is the average waiting time for FCFS with processes P1(0,5), P2(1,3), P3(2,1) arriving in order P1, P2, P3?",
          options: ["2.33", "3.0", "2.0", "2.67"],
          correctAnswer: "2.67"
        }
      ];
    } else if (quiz.topic === "Deadlocks") {
      return [
        {
          question: "Which is NOT a necessary condition for deadlock?",
          options: ["Mutual Exclusion", "Hold and Wait", "Concurrent Execution", "Circular Wait"],
          correctAnswer: "Concurrent Execution"
        },
        {
          question: "Deadlock prevention aims to:",
          options: ["Avoid deadlock after it occurs", "Detect deadlock and recover", "Ensure at least one necessary condition can't hold", "None of the above"],
          correctAnswer: "Ensure at least one necessary condition can't hold"
        },
        {
          question: "The banker's algorithm is used for:",
          options: ["Deadlock prevention", "Deadlock detection", "Deadlock recovery", "Deadlock avoidance"],
          correctAnswer: "Deadlock avoidance"
        }
      ];
    } else if (quiz.topic === "Memory Management") {
      return [
        {
          question: "What is fragmentation in memory management?",
          options: ["Memory that's allocated but not used", "Memory that's used but not allocated", "Memory that's corrupted", "None of the above"],
          correctAnswer: "Memory that's allocated but not used"
        },
        {
          question: "Which page replacement algorithm suffers from Belady's anomaly?",
          options: ["LRU", "FIFO", "Optimal", "MRU"],
          correctAnswer: "FIFO"
        },
        {
          question: "What is thrashing in virtual memory?",
          options: ["Excessive page faults", "Excessive fragments", "Excessive memory usage", "Excessive CPU usage"],
          correctAnswer: "Excessive page faults"
        }
      ];
    } else if (quiz.topic === "File Systems") {
      return [
        {
          question: "Which of the following is NOT a file allocation method?",
          options: ["Contiguous Allocation", "Linked Allocation", "Indexed Allocation", "Page Allocation"],
          correctAnswer: "Page Allocation"
        },
        {
          question: "In which directory structure does each file have a unique path?",
          options: ["Single-level Directory", "Two-level Directory", "Tree-structured Directory", "All of the above"],
          correctAnswer: "Tree-structured Directory"
        },
        {
          question: "What is a journaling file system?",
          options: ["A system that records all file operations", "A system that logs changes before committing them", "A file system that keeps multiple backups", "A file system for storing personal journals"],
          correctAnswer: "A system that logs changes before committing them"
        }
      ];
    } else {
      // Default questions
      return [
        {
          question: `What is the main concept of "${quiz.topic}"?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option B"
        },
        {
          question: `Which of the following is true about ${quiz.topic}?`,
          options: ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
          correctAnswer: "Statement 3"
        },
        {
          question: `Why is ${quiz.topic} important in operating systems?`,
          options: ["Reason 1", "Reason 2", "Reason 3", "Reason 4"],
          correctAnswer: "Reason 2"
        }
      ];
    }
  }, [quiz]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctAnswers = 0;
      quizQuestions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
          correctAnswers++;
        }
      });
      setScore(correctAnswers);
      setShowResults(true);
    }
  };

  const handleTryAgain = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleFinish = () => {
    // Mark quiz as completed
    if (quiz) {
      quiz.completed = true;
    }
    setIsOpen(false);
    // Reset state for next time
    setTimeout(() => {
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
    }, 300);
  };

  if (!quiz) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {!showResults ? (
              <span>{quiz.title}</span>
            ) : (
              <span>Quiz Results</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <>
            <div className="py-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                <span>
                  <Badge className={`${quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {quiz.difficulty}
                  </Badge>
                </span>
              </div>
              <Progress 
                value={(currentQuestion + 1) / quizQuestions.length * 100} 
                className="h-2 mb-6"
              />
              
              <h3 className="text-lg font-medium mb-4">
                {quizQuestions[currentQuestion]?.question}
              </h3>
              
              <RadioGroup 
                value={selectedAnswers[currentQuestion] || ""} 
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {quizQuestions[currentQuestion]?.options.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={option} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-grow cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <DialogFooter>
              <Button 
                disabled={!selectedAnswers[currentQuestion]}
                onClick={handleNext}
                className="w-full"
              >
                {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2">
                  {score}/{quizQuestions.length}
                </div>
                <p className="text-gray-500">
                  {score === quizQuestions.length ? 'Perfect score! Excellent work!' : 
                   score >= quizQuestions.length * 0.7 ? 'Good job! Keep practicing!' :
                   'Keep studying and try again!'}
                </p>
              </div>
              
              {quizQuestions.map((q, i) => (
                <div key={i} className="mb-4 text-left border-b pb-4">
                  <p className="font-medium">{i + 1}. {q.question}</p>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">Your answer:</span>
                    <Badge 
                      variant="outline" 
                      className={selectedAnswers[i] === q.correctAnswer ? 
                        "bg-green-100 text-green-800 border-green-200" : 
                        "bg-red-100 text-red-800 border-red-200"}
                    >
                      {selectedAnswers[i] || "No answer"}
                    </Badge>
                  </div>
                  {selectedAnswers[i] !== q.correctAnswer && (
                    <div className="flex items-center mt-1">
                      <span className="mr-2">Correct answer:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {q.correctAnswer}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <DialogFooter className="flex flex-row space-x-2">
              <Button variant="outline" onClick={handleTryAgain} className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                Finish
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function StudyRoadmap() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  // This would normally come from your database/API
  const roadmapData = {
    "Week 1": [
      [
        {
          "topic": "CPU Scheduling",
          "hours": 3
        }
      ],
      [
        {
          "topic": "CPU Scheduling",
          "hours": 1
        },
        {
          "topic": "Deadlocks",
          "hours": 2
        }
      ],
      [
        {
          "topic": "Memory Management",
          "hours": 1
        },
        {
          "topic": "File Systems",
          "hours": 2
        }
      ],
      [
        {
          "topic": "Process Synchronization",
          "hours": 2
        },
        {
          "topic": "Context Switching",
          "hours": 1
        }
      ]
    ]
  };
  
  // Mock weak topics (based on your previous data)
  const weakTopics = [
    {
      name: "Scheduling Algorithms (Preemptive vs Non-preemptive)",
      score: 2,
      explanation: "The student demonstrates a misunderstanding of preemptive and non-preemptive scheduling."
    },
    {
      name: "Deadlock Conditions and Handling",
      score: 1,
      explanation: "The student's understanding of deadlocks is flawed."
    },
    {
      name: "Memory Management",
      score: 1,
      explanation: "The student's explanation of paging is incorrect."
    },
    {
      name: "File Systems and Data Structures",
      score: 1,
      explanation: "The student lacks understanding of file system organization."
    }
  ];
  
  // Mock videos related to weak topics
  const recommendedVideos = [
    {
      id: 1,
      title: "CPU Scheduling Algorithms",
      thumbnail: "https://img.youtube.com/vi/2h3eWaPx8SA/mqdefault.jpg",
      duration: "15:24",
      channel: "OS Academy",
      topic: "CPU Scheduling",
      url: "https://www.youtube.com/watch?v=2h3eWaPx8SA"
    },
    {
      id: 2,
      title: "Deadlocks Explained Simply",
      thumbnail: "https://img.youtube.com/vi/UVo9mGARkhQ/mqdefault.jpg",
      duration: "12:07",
      channel: "Computer Science Hub",
      topic: "Deadlocks",
      url: "https://www.youtube.com/watch?v=UVo9mGARkhQ"
    },
    {
      id: 3,
      title: "Memory Management Techniques",
      thumbnail: "https://img.youtube.com/vi/qdkxXygc3rE/mqdefault.jpg",
      duration: "18:35",
      channel: "Tech Learning",
      topic: "Memory Management",
      url: "https://www.youtube.com/watch?v=qdkxXygc3rE"
    },
    {
      id: 4,
      title: "File Systems Deep Dive",
      thumbnail: "https://img.youtube.com/vi/KN8YgJnShPM/mqdefault.jpg",
      duration: "20:12",
      channel: "OS Academy",
      topic: "File Systems",
      url: "https://www.youtube.com/watch?v=KN8YgJnShPM"
    }
  ];
  
  // Mock quizzes data
  const quizzes = [
    {
      id: 1,
      title: "CPU Scheduling Quiz",
      questions: 10,
      difficulty: "Medium",
      topic: "CPU Scheduling",
      timeEstimate: "15 min",
      completed: false
    },
    {
      id: 2,
      title: "Deadlocks Challenge Quiz",
      questions: 8,
      difficulty: "Hard",
      topic: "Deadlocks",
      timeEstimate: "12 min",
      completed: false
    },
    {
      id: 3,
      title: "Memory Management Basics",
      questions: 12,
      difficulty: "Easy",
      topic: "Memory Management",
      timeEstimate: "18 min",
      completed: false
    },
    {
      id: 4,
      title: "File Systems Assessment",
      questions: 15,
      difficulty: "Medium",
      topic: "File Systems",
      timeEstimate: "20 min",
      completed: false
    }
  ];
  
  // Mock resources data
  const resources = [
    {
      id: 1,
      title: "CPU Scheduling Algorithms Cheat Sheet",
      type: "PDF",
      topic: "CPU Scheduling",
      url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/6_CPU_Scheduling.html"
    },
    {
      id: 2,
      title: "Deadlocks Visual Guide",
      type: "Interactive",
      topic: "Deadlocks",
      url: "https://deadlockempire.github.io/"
    },
    {
      id: 3,
      title: "Memory Management Handbook",
      type: "eBook",
      topic: "Memory Management",
      url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf"
    },
    {
      id: 4,
      title: "File Systems Architecture",
      type: "Article",
      topic: "File Systems",
      url: "https://www.cs.princeton.edu/courses/archive/fall09/cos318/lectures/FileSystem.pdf"
    }
  ];
  
  // Helper function to get color based on topic
  const getTopicColor = (topic) => {
    const colors = {
      "CPU Scheduling": "bg-blue-100 text-blue-800 border-blue-200",
      "Deadlocks": "bg-red-100 text-red-800 border-red-200",
      "Memory Management": "bg-green-100 text-green-800 border-green-200",
      "File Systems": "bg-purple-100 text-purple-800 border-purple-200",
      "Process Synchronization": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Context Switching": "bg-orange-100 text-orange-800 border-orange-200"
    };
    
    return colors[topic] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    if (difficulty === "Easy") return "bg-green-100 text-green-800";
    if (difficulty === "Medium") return "bg-yellow-100 text-yellow-800";
    if (difficulty === "Hard") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };
  
  // Helper function to get resource type icon
  const getResourceTypeIcon = (type) => {
    if (type === "PDF") return <FileText className="h-4 w-4" />;
    if (type === "Interactive") return <ExternalLink className="h-4 w-4" />;
    if (type === "eBook") return <BookOpen className="h-4 w-4" />;
    if (type === "Article") return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Enhanced function to open a quiz
  const openQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizOpen(true);
  };

  // Enhanced function to open a study session
  const startStudySession = (topic) => {
    // First check if there's a video
    const video = recommendedVideos.find(v => v.topic.includes(topic));
    // Then check if there's a resource
    const resource = resources.find(r => r.topic.includes(topic));
    // Then check if there's a quiz
    const quiz = quizzes.find(q => q.topic.includes(topic));
    
    const message = `
      Study Session for: ${topic}
      
      Available Resources:
      ${video ? `• Video: ${video.title} (will open in new tab)` : '• No videos available for this topic yet'}
      ${resource ? `• Resource: ${resource.title} (will open in new tab)` : '• No resources available for this topic yet'}
      ${quiz ? `• Quiz: ${quiz.title} (can be started after studying)` : '• No quizzes available for this topic yet'}
      
      Opening available resources...
    `;
    
    alert(message);
    
    // Open resources in new tabs
    if (video) window.open(video.url, "_blank");
    if (resource) setTimeout(() => window.open(resource.url, "_blank"), 500);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-1 text-gray-900">Your Study Roadmap</h1>
        <p className="text-gray-600 mb-6">Personalized plan based on your identified weak areas</p>
        
        <Tabs defaultValue="roadmap" className="mb-8" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="roadmap">Study Plan</TabsTrigger>
            <TabsTrigger value="videos">Recommended Videos</TabsTrigger>
            <TabsTrigger value="quizzes">Practice Quizzes</TabsTrigger>
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
          </TabsList>
          
          {/* Study Plan Roadmap */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Weekly Study Plan</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Week 1
                  </Badge>
                </div>
                <CardDescription>
                  Based on your assessment, we've created a personalized study plan focusing on your weak areas.
                </CardDescription>
                <Progress value={25} className="h-2 mt-2" />
              </CardHeader>
              
              <CardContent>
                <div className="space-y-8">
                  {Object.keys(roadmapData).map(week => (
                    <div key={week} className="space-y-4">
                      {roadmapData[week].map((day, dayIndex) => (
                        <Card key={dayIndex} className="border border-gray-200">
                          <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-sm font-medium">Day {dayIndex + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {day.map((session, sessionIndex) => (
                                <div key={sessionIndex} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-md ${getTopicColor(session.topic)} flex items-center justify-center`}>
                                      {session.topic.includes("CPU") && <BookOpen className="h-5 w-5" />}
                                      {session.topic.includes("Dead") && <FileText className="h-5 w-5" />}
                                      {session.topic.includes("Memory") && <BookOpen className="h-5 w-5" />}
                                      {session.topic.includes("File") && <FileText className="h-5 w-5" />}
                                      {session.topic.includes("Process") && <BookOpen className="h-5 w-5" />}
                                      {session.topic.includes("Context") && <FileText className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <div className="font-medium">{session.topic}</div>
                                      <div className="text-sm text-gray-500 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" /> {session.hours} {session.hours > 1 ? 'hours' : 'hour'}
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                                    const topic = session.topic;
                                    const quiz = quizzes.find(q => q.topic === topic);
                                    if (quiz) openQuiz(quiz);
                                    else alert(`Study resources for ${topic} coming soon`);
                                  }}>
                                    Start <ArrowRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Areas to Focus On</CardTitle>
                <CardDescription>
                  Based on your assessment, these topics need the most attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weakTopics.map((topic, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{topic.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{topic.explanation}</p>
                        </div>
                        <Badge variant="outline" className={topic.score <= 1 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                          Score: {topic.score}/5
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          const video = recommendedVideos.find(v => v.topic === topic.name);
                          if (video && video.url) startStudySession(topic.name);
                          else alert(`Video for ${topic.name} coming soon`);
                        }}>
                          <Video className="h-3 w-3" /> Watch Video
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          const quiz = quizzes.find(q => q.topic === topic.name);
                          if (quiz) openQuiz(quiz);
                          else alert(`Quiz for ${topic.name} coming soon`);
                        }}>
                          <FileText className="h-3 w-3" /> Practice Quiz
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Videos</CardTitle>
                <CardDescription>
                  Watch these videos to strengthen your understanding of key concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedVideos.map(video => (
                    <Card key={video.id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(video.url || "#", "_blank")}>
                      <div className="aspect-video relative">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <PlayCircle className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{video.channel}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <Badge className={getTopicColor(video.topic)}>
                            {video.topic}
                          </Badge>
                          <Button size="sm" variant="ghost" className="gap-1" onClick={(e) => {
                            e.stopPropagation();
                            window.open(video.url || "#", "_blank");
                          }}>
                            <PlayCircle className="h-3 w-3" /> Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Practice Quizzes</CardTitle>
                <CardDescription>
                  Test your knowledge and reinforce your understanding with these quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizzes.map(quiz => (
                    <Card key={quiz.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{quiz.title}</h3>
                            <div className="flex gap-6 text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" /> {quiz.questions} questions
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> {quiz.timeEstimate}
                              </div>
                            </div>
                          </div>
                          <Badge className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant="outline" className={getTopicColor(quiz.topic)}>
                            {quiz.topic}
                          </Badge>
                          <Button size="sm" className="gap-1" onClick={() => openQuiz(quiz)}>
                            Start Quiz <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <CardDescription>
                  Additional materials to help you master these topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map(resource => (
                    <Card key={resource.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 text-blue-800 rounded flex items-center justify-center">
                            {getResourceTypeIcon(resource.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{resource.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <Badge variant="outline" className="bg-gray-100">
                                {resource.type}
                              </Badge>
                            </p>
                            <div className="mt-3 flex justify-between items-center">
                              <Badge className={getTopicColor(resource.topic)}>
                                {resource.topic}
                              </Badge>
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(resource.url || "#", "_blank")}>
                                Open <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Quiz Modal */}
      <QuizModal isOpen={quizOpen} setIsOpen={setQuizOpen} quiz={selectedQuiz} />
    </div>
  );
} 