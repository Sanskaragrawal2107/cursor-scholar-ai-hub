import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Tabs,
  TabsContent,
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Plus,
  CalendarIcon, 
  Users, 
  BookOpen, 
  FileText,
  Calendar as CalendarIcon2,
  Clock,
  CheckCircle,
  ClipboardCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getClassroom, getClassroomStudents, getClassroomAssignments, createAssignment, getAssignmentSubmissions } from '@/lib/api';
import { uploadFile } from '@/lib/storage';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  class_code: string;
  teacher_id: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject_topic: string | null;
  due_date: string | null;
  created_at: string;
  file_url: string | null;
}

interface Submission {
  id: string;
  student_id: string;
  submitted_at: string;
  ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  users: {
    full_name: string | null;
  };
}

const ClassroomPage = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { user, userMetadata } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // New assignment form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
  const [newAssignmentTopic, setNewAssignmentTopic] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState<Date | null>(null);
  const [newAssignmentFile, setNewAssignmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load classroom data
  useEffect(() => {
    async function loadClassroomData() {
      if (!classroomId || !user) return;
      
      try {
        setLoading(true);
        
        // Get classroom details
        const classroomData = await getClassroom(classroomId);
        setClassroom(classroomData);
        
        // Get students in this classroom
        const studentsData = await getClassroomStudents(classroomId);
        setStudents(studentsData);
        
        // Get assignments for this classroom
        const assignmentsData = await getClassroomAssignments(classroomId);
        setAssignments(assignmentsData);
        
        // If there are assignments, select the first one by default
        if (assignmentsData.length > 0) {
          setSelectedAssignment(assignmentsData[0].id);
          
          // Load submissions for this assignment
          const submissionsData = await getAssignmentSubmissions(assignmentsData[0].id);
          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.error('Error loading classroom data:', error);
        toast({
          title: 'Failed to load classroom data',
          description: 'There was an error loading the classroom details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadClassroomData();
  }, [classroomId, user, toast]);

  // Load submissions when selected assignment changes
  useEffect(() => {
    async function loadSubmissions() {
      if (!selectedAssignment) return;
      
      try {
        const submissionsData = await getAssignmentSubmissions(selectedAssignment);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
    }

    loadSubmissions();
  }, [selectedAssignment]);

  // Handle creating a new assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !classroomId) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload file first if provided
      let fileUrl = null;
      let filePath = null;
      
      if (newAssignmentFile) {
        const result = await uploadFile('assignments', newAssignmentFile, {
          classroom_id: classroomId,
          teacher_id: user.id
        });
        fileUrl = result.url;
        filePath = result.path;
      }
      
      // Create assignment record
      const assignment = await createAssignment(
        classroomId,
        newAssignmentTitle,
        newAssignmentDescription,
        newAssignmentTopic,
        fileUrl,
        filePath,
        newAssignmentDueDate ? newAssignmentDueDate.toISOString() : null
      );
      
      // Add to local state
      setAssignments([assignment, ...assignments]);
      
      // If this is the first assignment, select it automatically
      if (assignments.length === 0) {
        setSelectedAssignment(assignment.id);
      }
      
      // Reset form
      setNewAssignmentTitle('');
      setNewAssignmentDescription('');
      setNewAssignmentTopic('');
      setNewAssignmentDueDate(null);
      setNewAssignmentFile(null);
      setCreateDialogOpen(false);
      
      toast({
        title: 'Assignment created',
        description: 'The assignment has been successfully created'
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Failed to create assignment',
        description: 'There was an error creating the assignment',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading classroom...</div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Classroom Not Found</CardTitle>
            <CardDescription>The classroom you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is the teacher for this classroom
  const isTeacher = user?.id === classroom.teacher_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(isTeacher ? '/teacher-dashboard' : '/student-dashboard')}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classroom.name}</h1>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">Class Code:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {classroom.class_code}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isTeacher && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAssignment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignment-title">Assignment Title</Label>
                      <Input 
                        id="assignment-title" 
                        value={newAssignmentTitle}
                        onChange={(e) => setNewAssignmentTitle(e.target.value)}
                        placeholder="e.g. Introduction to Data Structures"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignment-description">Description</Label>
                      <Textarea 
                        id="assignment-description" 
                        value={newAssignmentDescription}
                        onChange={(e) => setNewAssignmentDescription(e.target.value)}
                        placeholder="Provide details about the assignment"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignment-topic">Subject/Topic</Label>
                      <Input 
                        id="assignment-topic" 
                        value={newAssignmentTopic}
                        onChange={(e) => setNewAssignmentTopic(e.target.value)}
                        placeholder="e.g. Data Structures, Algorithms, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newAssignmentDueDate ? format(newAssignmentDueDate, 'PPP') : <span>Select due date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAssignmentDueDate || undefined}
                            onSelect={setNewAssignmentDueDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Assignment Document (PDF)</Label>
                      <FileUpload 
                        onFileChange={setNewAssignmentFile}
                        accept="application/pdf"
                        maxSize={10}
                        buttonText="Upload PDF Assignment"
                      />
                    </div>
                    <div className="pt-2 flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting || !newAssignmentTitle}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Assignment'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-700">
            {classroom.description || 'No description provided for this classroom.'}
          </p>
        </div>

        <Tabs defaultValue="assignments" className="space-y-8">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="assignments" className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Students ({students.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {assignments.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No assignments yet</div>
                  {isTeacher ? (
                    <div>
                      <div className="text-sm text-gray-400 mb-4">Create your first assignment to get started</div>
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">The teacher hasn't posted any assignments yet</div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment List */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-medium mb-4">All Assignments</h3>
                  <div className="space-y-3">
                    {assignments.map(assignment => (
                      <Card 
                        key={assignment.id} 
                        className={cn(
                          "cursor-pointer hover:shadow-md transition-all",
                          selectedAssignment === assignment.id ? "border-blue-500 ring-1 ring-blue-500" : ""
                        )}
                        onClick={() => setSelectedAssignment(assignment.id)}
                      >
                        <CardContent className="p-4">
                          <h4 className="text-lg font-medium">{assignment.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            <CalendarIcon2 className="h-3 w-3 mr-1" />
                            <span>{new Date(assignment.created_at).toLocaleDateString()}</span>
                            {assignment.due_date && (
                              <>
                                <span className="mx-1">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Assignment Details & Submissions */}
                <div className="lg:col-span-2">
                  {selectedAssignment && (() => {
                    const assignment = assignments.find(a => a.id === selectedAssignment);
                    if (!assignment) return null;
                    
                    return (
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>{assignment.title}</CardTitle>
                            {assignment.subject_topic && (
                              <Badge className="bg-blue-100 text-blue-800 inline-block">
                                {assignment.subject_topic}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-gray-700">
                              {assignment.description || 'No description provided for this assignment.'}
                            </p>
                            
                            {assignment.due_date && (
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                <span>
                                  Due: <span className="font-medium">{new Date(assignment.due_date).toLocaleDateString()}</span>
                                </span>
                              </div>
                            )}
                            
                            {assignment.file_url && (
                              <div>
                                <a 
                                  href={assignment.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Assignment Document
                                </a>
                              </div>
                            )}
                            
                            {isTeacher ? (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-medium">Student Submissions ({submissions.length})</h3>
                                  <Badge variant="outline" className="font-normal">
                                    Created {getRelativeTime(assignment.created_at)}
                                  </Badge>
                                </div>
                                
                                {submissions.length === 0 ? (
                                  <div className="text-gray-500 text-sm py-4 text-center border rounded-md">
                                    No submissions yet
                                  </div>
                                ) : (
                                  <div className="space-y-3 mt-4">
                                    {submissions.map(submission => (
                                      <Card key={submission.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium">
                                              {submission.users?.full_name || 'Anonymous Student'}
                                            </div>
                                            <Badge className={getStatusColor(submission.ai_analysis_status)}>
                                              {submission.ai_analysis_status.replace('_', ' ')}
                                            </Badge>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Submitted {getRelativeTime(submission.submitted_at)}
                                          </div>
                                          <div className="mt-2">
                                            <Button size="sm" variant="outline">
                                              View Submission
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <Button 
                                  className="w-full"
                                  onClick={() => navigate(`/assignment/${assignment.id}`)}
                                >
                                  <ClipboardCheck className="h-4 w-4 mr-2" />
                                  View and Submit Assignment
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {students.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No students enrolled yet</div>
                  <div className="text-sm text-gray-400">
                    {isTeacher ? 
                      'Share your class code with students to join' : 
                      'You are the first student in this classroom!'
                    }
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(student => (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="font-medium">{student.full_name || 'Unnamed Student'}</div>
                      <div className="text-sm text-gray-600">{student.email || 'No email'}</div>
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

export default ClassroomPage; 