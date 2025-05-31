import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { ArrowLeft, FileText, Clock, Upload, CheckCircle2, DownloadCloud, BookOpen } from 'lucide-react';
import { getAssignment, getSubmission, createSubmission, triggerSubmissionAnalysis } from '@/lib/api';
import { uploadFile } from '@/lib/storage';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject_topic: string | null;
  due_date: string | null;
  file_url: string | null;
  created_at: string;
  classrooms: {
    id: string;
    name: string;
  };
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content_text: string | null;
  file_url: string | null;
  submitted_at: string;
  ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
}

const AssignmentPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  
  // Form state
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadAssignmentData() {
      if (!assignmentId || !user) return;
      
      try {
        setLoading(true);
        
        // Get assignment details
        const assignmentData = await getAssignment(assignmentId);
        setAssignment(assignmentData);
        
        // Check if student has already submitted
        const existingSubmission = await getSubmission(assignmentId, user.id);
        
        if (existingSubmission) {
          setSubmission(existingSubmission);
          setSubmissionText(existingSubmission.content_text || '');
        }
      } catch (error) {
        console.error('Error loading assignment data:', error);
        toast({
          title: 'Failed to load assignment',
          description: 'There was an error loading the assignment details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadAssignmentData();
  }, [assignmentId, user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignmentId) return;
    
    try {
      setSubmitting(true);
      
      // Upload file if provided
      let fileUrl = null;
      let filePath = null;
      
      if (submissionFile) {
        const result = await uploadFile('submissions', submissionFile, {
          assignment_id: assignmentId,
          student_id: user.id
        });
        fileUrl = result.url;
        filePath = result.path;
      }
      
      // Create submission record
      const newSubmission = await createSubmission(
        assignmentId,
        user.id,
        submissionText || null,
        fileUrl,
        filePath
      );
      
      setSubmission(newSubmission);
      
      toast({
        title: 'Assignment submitted',
        description: 'Your submission has been received and is being analyzed'
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: 'Failed to submit assignment',
        description: 'There was an error submitting your work',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add this function to handle manual PDF analysis
  const handleAnalyzePDF = async () => {
    if (!submission) return;
    
    try {
      setSubmitting(true);
      
      toast({
        title: 'Analysis Started',
        description: 'Your submission is being analyzed by AI'
      });
      
      await triggerSubmissionAnalysis(submission.id);
      
      // Refresh submission data to get updated status
      const updatedSubmission = await getSubmission(assignmentId!, user!.id);
      setSubmission(updatedSubmission);
      
    } catch (error) {
      console.error('Error analyzing submission:', error);
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing your work',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Assignment Not Found</CardTitle>
            <CardDescription>The assignment you're looking for doesn't exist</CardDescription>
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

  const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const hasSubmitted = !!submission;
  const isAnalyzing = hasSubmitted && (submission.ai_analysis_status === 'pending' || submission.ai_analysis_status === 'processing');
  const isAnalyzed = hasSubmitted && submission.ai_analysis_status === 'completed';
  const analysisError = hasSubmitted && submission.ai_analysis_status === 'failed';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/classroom/${assignment.classrooms.id}`)}
              className="hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classroom
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assignment</h1>
              <p className="text-sm text-gray-600">{assignment.classrooms.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                    {assignment.subject_topic && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800">{assignment.subject_topic}</Badge>
                    )}
                  </div>
                  {isPastDue && (
                    <Badge variant="destructive">Past Due</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  {assignment.description || 'No description provided for this assignment.'}
                </p>
                
                {assignment.due_date && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    <span>
                      Due: <span className="font-medium">{new Date(assignment.due_date).toLocaleDateString()} at {new Date(assignment.due_date).toLocaleTimeString()}</span>
                    </span>
                  </div>
                )}
                
                {assignment.file_url && (
                  <div>
                    <a 
                      href={assignment.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Download Assignment PDF
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submission Form */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Your Submission</h2>
              
              {hasSubmitted ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                      Submitted
                    </CardTitle>
                    <CardDescription>
                      Submitted on {new Date(submission.submitted_at).toLocaleDateString()} at {new Date(submission.submitted_at).toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submission.content_text && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Response:</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{submission.content_text}</p>
                      </div>
                    )}
                    
                    {submission.file_url && (
                      <a 
                        href={submission.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Your Submitted PDF
                      </a>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium flex items-center">
                          AI Analysis Status:
                          <Badge className="ml-2" variant={isAnalyzed ? 'default' : isAnalyzing ? 'outline' : 'destructive'}>
                            {submission.ai_analysis_status.replace('_', ' ')}
                          </Badge>
                        </h3>
                        
                        {/* Add the Analyze PDF button */}
                        {(analysisError || !isAnalyzing) && submission.file_url && (
                          <Button 
                            onClick={handleAnalyzePDF} 
                            size="sm"
                            disabled={submitting || isAnalyzing}
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Analyze PDF
                          </Button>
                        )}
                      </div>
                      
                      {isAnalyzing && (
                        <div className="text-sm text-gray-600">
                          Your submission is being analyzed by AI to identify knowledge gaps and create personalized resources. 
                          This may take a few moments.
                        </div>
                      )}
                      
                      {isAnalyzed && (
                        <div className="text-sm text-gray-600">
                          Analysis complete. Visit the Learning Hub to see personalized resources based on this submission.
                          <div className="mt-4">
                            <Button onClick={() => navigate('/learning-hub')}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Go to Learning Hub
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {analysisError && (
                        <div className="text-sm text-red-600">
                          There was an error analyzing your submission. We apologize for the inconvenience.
                          Try clicking the "Analyze PDF" button to retry.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Your Work</CardTitle>
                    <CardDescription>
                      {isPastDue ? 
                        'Note: This assignment is past due, but you can still submit your work.' :
                        'Complete and submit your assignment before the due date.'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Textarea
                          placeholder="Type your answer here..."
                          className="min-h-[150px]"
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Attach PDF (Optional)</h4>
                        <FileUpload 
                          onFileChange={setSubmissionFile}
                          accept="application/pdf"
                          maxSize={10}
                          buttonText="Upload Your Solution"
                        />
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={submitting || (!submissionText && !submissionFile)}
                        >
                          {submitting ? 'Submitting...' : 'Submit Assignment'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Sidebar with submission status */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-600">Assignment</div>
                  <div className="text-lg font-medium">{assignment.title}</div>
                </div>
                
                {assignment.due_date && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">Due Date</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-orange-500" />
                      <span className={isPastDue ? 'text-red-600 font-medium' : ''}>
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-600">Status</div>
                  <div>
                    {hasSubmitted ? (
                      <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                    ) : isPastDue ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : (
                      <Badge variant="outline">Pending Submission</Badge>
                    )}
                  </div>
                </div>
                
                {hasSubmitted && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">Submitted</div>
                    <div>{new Date(submission.submitted_at).toLocaleString()}</div>
                  </div>
                )}
                
                {hasSubmitted && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">AI Analysis</div>
                    <div>
                      {isAnalyzed ? (
                        <Badge className="bg-green-100 text-green-800">Complete</Badge>
                      ) : isAnalyzing ? (
                        <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {hasSubmitted ? (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate('/learning-hub')}
                  >
                    Go to Learning Hub
                  </Button>
                ) : (
                  <div className="text-xs text-center text-gray-500 w-full">
                    Submit your work to receive personalized AI feedback and learning resources.
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage; 