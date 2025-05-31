import { supabase } from './supabase';
import { Database } from './database.types';

// Types for our API functions
type User = Database['public']['Tables']['users']['Row'];
type Classroom = Database['public']['Tables']['classrooms']['Row'];
type ClassroomMember = Database['public']['Tables']['classroom_members']['Row'];
type Assignment = Database['public']['Tables']['assignments']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type StudentWeakTopic = Database['public']['Tables']['student_weak_topics']['Row'];
type PersonalizedRecommendation = Database['public']['Tables']['personalized_recommendations']['Row'];

// User Profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Classroom Management
export async function createClassroom(name: string, description: string | null, teacherId: string) {
  // Generate a random 6-character class code
  const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('classrooms')
    .insert([{ name, description, teacher_id: teacherId, class_code: classCode }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getClassrooms(teacherId: string) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId);
  
  if (error) throw error;
  return data;
}

export async function getClassroomsByStudent(studentId: string) {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('classroom_id, classrooms(*)')
    .eq('student_id', studentId);
  
  if (error) throw error;
  return data.map(item => item.classrooms);
}

export async function joinClassroom(classCode: string, studentId: string) {
  // First find the classroom with the given code
  const { data: classroom, error: classroomError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('class_code', classCode)
    .single();
  
  if (classroomError) throw classroomError;
  
  if (!classroom) {
    throw new Error('Classroom not found with that code');
  }
  
  // Then add the student to the classroom
  const { data, error } = await supabase
    .from('classroom_members')
    .insert([{ classroom_id: classroom.id, student_id: studentId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getClassroomStudents(classroomId: string) {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('student_id, users(*)')
    .eq('classroom_id', classroomId);
  
  if (error) throw error;
  return data.map(item => item.users);
}

// Get total students for a teacher
export async function getTotalStudentCount(teacherId: string) {
  // First get all classrooms for the teacher
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', teacherId);
  
  if (classroomsError) throw classroomsError;
  
  if (!classrooms || classrooms.length === 0) {
    return 0;
  }
  
  // Then count distinct students in these classrooms
  const classroomIds = classrooms.map(classroom => classroom.id);
  
  const { count, error } = await supabase
    .from('classroom_members')
    .select('student_id', { count: 'exact', head: true })
    .in('classroom_id', classroomIds);
  
  if (error) throw error;
  return count || 0;
}

// Get single classroom details
export async function getClassroom(classroomId: string) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomId)
    .single();
  
  if (error) throw error;
  return data;
}

// Assignments
export async function createAssignment(
  classroomId: string,
  title: string,
  description: string | null,
  subjectTopic: string | null,
  fileUrl: string | null,
  filePath: string | null,
  dueDate: string | null
) {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{ 
      classroom_id: classroomId,
      title,
      description,
      subject_topic: subjectTopic,
      file_url: fileUrl,
      file_path: filePath,
      due_date: dueDate
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getClassroomAssignments(classroomId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getAssignment(assignmentId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, classrooms(*)')
    .eq('id', assignmentId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTeacherAssignments(teacherId: string) {
  // Get all classrooms for the teacher
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', teacherId);
  
  if (classroomsError) throw classroomsError;
  
  if (!classrooms || classrooms.length === 0) {
    return [];
  }
  
  // Get assignments from those classrooms
  const classroomIds = classrooms.map(classroom => classroom.id);
  
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .in('classroom_id', classroomIds);
  
  if (error) throw error;
  return data;
}

export async function getStudentAssignments(studentId: string) {
  // Get all classrooms the student is part of
  const { data: classroomMemberships, error: membershipError } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .eq('student_id', studentId);
  
  if (membershipError) throw membershipError;
  
  if (!classroomMemberships || classroomMemberships.length === 0) {
    return [];
  }
  
  // Get assignments from those classrooms
  const classroomIds = classroomMemberships.map(membership => membership.classroom_id);
  
  const { data, error } = await supabase
    .from('assignments')
    .select('*, classrooms(name)')
    .in('classroom_id', classroomIds)
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Submissions
export async function createSubmission(
  assignmentId: string,
  studentId: string,
  contentText?: string | null,
  fileUrl?: string | null,
  filePath?: string | null
) {
  const { data, error } = await supabase
    .from('submissions')
    .insert([{ 
      assignment_id: assignmentId,
      student_id: studentId,
      content_text: contentText,
      file_url: fileUrl,
      file_path: filePath,
      submitted_at: new Date().toISOString(),
      ai_analysis_status: 'pending'
    }])
    .select()
    .single();
  
  if (error) throw error;

  // Request AI analysis (in a real app, this would trigger a serverless function)
  await triggerSubmissionAnalysis(data.id);
  
  return data;
}

export async function getSubmission(assignmentId: string, studentId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found" error
    throw error;
  }
  
  return data || null;
}

export async function getAssignmentSubmissions(assignmentId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, users(full_name)')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getTeacherRecentSubmissions(teacherId: string, limit = 5) {
  // First get all classrooms for the teacher
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', teacherId);
  
  if (classroomsError) throw classroomsError;
  
  if (!classrooms || classrooms.length === 0) {
    return [];
  }
  
  // Get assignments from those classrooms
  const classroomIds = classrooms.map(classroom => classroom.id);
  
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('id, file_url')
    .in('classroom_id', classroomIds);
  
  if (assignmentsError) throw assignmentsError;
  
  if (!assignments || assignments.length === 0) {
    return [];
  }
  
  // Get recent submissions for those assignments
  const assignmentIds = assignments.map(assignment => assignment.id);
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      student_id,
      assignment_id,
      submitted_at,
      ai_analysis_status,
      file_url,
      file_path,
      content_text,
      assignments(title, id, file_url, file_path),
      users(id, full_name, email)
    `)
    .in('assignment_id', assignmentIds)
    .order('submitted_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// AI Analysis Management

// Trigger AI analysis for a submission
export async function triggerSubmissionAnalysis(submissionId: string) {
  // First set status to processing so UI shows something is happening
  await supabase
    .from('submissions')
    .update({ ai_analysis_status: 'processing' })
    .eq('id', submissionId);
    
  // Get submission details along with the assignment
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('*, assignments(*)')
    .eq('id', submissionId)
    .single();
  
  if (submissionError) throw submissionError;
  
  // Send both PDFs to Make.com webhook
  const webhookUrl = 'https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu';
  
  try {
    // Only send if we have both PDFs
    if (submission.file_url && submission.assignments.file_url) {
      // Listen for real-time updates from Supabase
      const subscription = supabase
        .channel('submission-status')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'submissions',
          filter: `id=eq.${submissionId}` 
        }, (payload) => {
          console.log('Submission status updated:', payload);
          // This will update the UI when Make.com updates the database
        })
        .subscribe();
      
      // Send request to Make.com with additional debugging
      console.log('Sending to Make.com:', JSON.stringify({
        submissionId: submission.id,
        studentId: submission.student_id,
        assignmentId: submission.assignment_id,
        assignmentPdfUrl: submission.assignments.file_url,
        studentSubmissionPdfUrl: submission.file_url,
        directAnalysis: true,
        callbackUrl: `${window.location.origin}/api/webhook/make`
      }));
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          studentId: submission.student_id,
          assignmentId: submission.assignment_id,
          assignmentPdfUrl: submission.assignments.file_url,
          studentSubmissionPdfUrl: submission.file_url,
          directAnalysis: true,
          callbackUrl: `${window.location.origin}/api/webhook/make`
        })
      });

      // Handle direct response from Make.com if it includes feedback
      try {
        const responseData = await response.json();
        console.log('Make.com response:', JSON.stringify(responseData));
        
        if (responseData) {
          // DIRECT UPDATE: Update Supabase database with response
          let updateData: Record<string, any> = {
            ai_analysis_status: 'completed'
          };
          
          // Process feedback and extract weak topics
          let parsedFeedback: any = null;
          let weakTopics: any[] = [];
          
          if (responseData.feedback) {
            try {
              // Handle both string and object feedback
              if (typeof responseData.feedback === 'string') {
                parsedFeedback = JSON.parse(responseData.feedback);
              } else {
                parsedFeedback = responseData.feedback;
              }
              
              updateData.ai_feedback = parsedFeedback;
              console.log('Processed feedback:', updateData.ai_feedback);
              
              // Extract weak topics from parsed feedback
              if (parsedFeedback && typeof parsedFeedback === 'object') {
                // If it contains a weakTopics array, use that
                if (Array.isArray(parsedFeedback.weakTopics)) {
                  weakTopics = parsedFeedback.weakTopics;
                } 
                // If feedback itself is an array, use it directly
                else if (Array.isArray(parsedFeedback)) {
                  weakTopics = parsedFeedback;
                }
                // Otherwise, try to create a topic from the feedback
                else {
                  // Create at least one weak topic from whatever we have
                  weakTopics = [{
                    name: parsedFeedback.topic || parsedFeedback.name || "Identified Topic",
                    score: parsedFeedback.score || parsedFeedback.confidenceScore || 50,
                    explanation: parsedFeedback.explanation || parsedFeedback.description || JSON.stringify(parsedFeedback)
                  }];
                }
              } else if (typeof parsedFeedback === 'string') {
                // If it's a simple string, create a topic from it
                weakTopics = [{
                  name: "Identified Topic",
                  score: 50,
                  explanation: parsedFeedback
                }];
              }
            } catch (feedbackError) {
              console.error('Error parsing feedback:', feedbackError);
              // Even if parsing fails, create a topic from the raw string
              weakTopics = [{
                name: "Identified Topic",
                score: 50,
                explanation: String(responseData.feedback)
              }];
              
              // Still use the feedback even if parsing fails
              updateData.ai_feedback = { rawText: responseData.feedback };
            }
          }
          
          console.log('Extracted weak topics:', weakTopics);
          
          // 1. Update the submission record
          const { data: updateResult, error: updateError } = await supabase
            .from('submissions')
            .update(updateData)
            .eq('id', submissionId)
            .select();
            
          if (updateError) {
            console.error('Error updating submission with feedback:', updateError);
          } else {
            console.log('Successfully updated submission with feedback');
          }
          
          // 2. Add entries to student_weak_topics table if we have topics
          if (weakTopics.length > 0) {
            try {
              // First, delete any existing topics
              await supabase
                .from('student_weak_topics')
                .delete()
                .eq('student_id', submission.student_id)
                .eq('assignment_id', submission.assignment_id);
              
              // Insert new topics
              const topicsToInsert = weakTopics.map(topic => ({
                student_id: submission.student_id,
                assignment_id: submission.assignment_id,
                topic_name: topic.name || topic.topic_name || topic.topicName || "Topic",
                confidence_score: topic.score || topic.confidence_score || topic.confidenceScore || 50,
                ai_explanation: topic.explanation || topic.ai_explanation || topic.aiExplanation || "Identified by AI"
              }));
              
              const { error: insertError } = await supabase
                .from('student_weak_topics')
                .insert(topicsToInsert);
                
              if (insertError) {
                console.error('Error inserting weak topics:', insertError);
              } else {
                console.log('Successfully added', topicsToInsert.length, 'weak topics');
              }
            } catch (topicError) {
              console.error('Error adding student weak topics:', topicError);
            }
          }
        }
      } catch (jsonError) {
        console.log('No immediate feedback from Make.com or error parsing response:', jsonError);
      }
      
      // Set a timeout to check if Make.com updated the status
      // If not, we'll update it ourselves to avoid stuck "processing" state
      setTimeout(async () => {
        const { data } = await supabase
          .from('submissions')
          .select('ai_analysis_status')
          .eq('id', submissionId)
          .single();
          
        if (data && data.ai_analysis_status === 'processing') {
          // Make.com didn't update the status, so we'll do it
          await supabase
            .from('submissions')
            .update({ ai_analysis_status: 'completed' })
            .eq('id', submissionId);
            
          console.log('Status automatically updated to completed after timeout');
        }
        
        // Clean up subscription
        supabase.removeChannel(subscription);
      }, 30000); // 30 seconds timeout
      
      return true;
    } else {
      // Fall back to the simulation if PDFs are not available
      setTimeout(() => simulateAIAnalysis(submissionId), 10000);
      return true;
    }
  } catch (error) {
    console.error("Error sending to webhook:", error);
    // Update status to failed
    await supabase
      .from('submissions')
      .update({ ai_analysis_status: 'failed' })
      .eq('id', submissionId);
    return false;
  }
}

// This is a simulation of AI analysis - in a real app, this would be a serverless function
async function simulateAIAnalysis(submissionId: string) {
  try {
    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('*, assignments(*)')
      .eq('id', submissionId)
      .single();
    
    if (submissionError) throw submissionError;
    
    // Generate random weak topics
    const topics = ['Data Structures', 'Algorithms', 'Database Concepts', 'System Design', 'Memory Management'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const confidenceScore = Math.floor(Math.random() * 80) + 20; // 20-100
    
    // Add weak topic
    const { data: weakTopic, error: weakTopicError } = await supabase
      .from('student_weak_topics')
      .insert([{
        student_id: submission.student_id,
        assignment_id: submission.assignment_id,
        topic_name: randomTopic,
        confidence_score: confidenceScore,
        ai_explanation: `The student shows difficulty in understanding ${randomTopic} concepts.`
      }])
      .select()
      .single();
    
    if (weakTopicError) throw weakTopicError;
    
    // Create a recommendation
    const recommendationTypes = ['youtube_video', 'resource_link', 'study_plan_item', 'quiz'];
    const randomType = recommendationTypes[Math.floor(Math.random() * recommendationTypes.length)];
    
    const { error: recommendationError } = await supabase
      .from('personalized_recommendations')
      .insert([{
        student_id: submission.student_id,
        student_weak_topic_id: weakTopic.id,
        recommendation_type: randomType,
        title: `Learn ${randomTopic} - Personalized Resource`,
        description: `This resource will help you understand ${randomTopic} better.`,
        url: 'https://example.com',
        details: {
          progress: 0,
          totalSteps: 5,
          completedSteps: 0,
          questions: 10,
          difficulty: 'Medium',
          estimatedTime: '30 min',
          attempts: 0,
          nextStep: `Review ${randomTopic} basics`,
          type: 'Article'
        }
      }]);
    
    if (recommendationError) throw recommendationError;
    
    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ ai_analysis_status: 'completed' })
      .eq('id', submissionId);
    
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    // Update submission status to failed
    await supabase
      .from('submissions')
      .update({ ai_analysis_status: 'failed' })
      .eq('id', submissionId);
  }
}

// Student Weak Topics
export async function getStudentWeakTopics(studentId: string) {
  const { data, error } = await supabase
    .from('student_weak_topics')
    .select('*, assignments(title)')
    .eq('student_id', studentId);
  
  if (error) throw error;
  return data;
}

export async function getTeacherWeakTopicsCount(teacherId: string) {
  // First get all classrooms for the teacher
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', teacherId);
  
  if (classroomsError) throw classroomsError;
  
  if (!classrooms || classrooms.length === 0) {
    return 0;
  }
  
  // Get assignments from those classrooms
  const classroomIds = classrooms.map(classroom => classroom.id);
  
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('id')
    .in('classroom_id', classroomIds);
  
  if (assignmentsError) throw assignmentsError;
  
  if (!assignments || assignments.length === 0) {
    return 0;
  }
  
  // Count weak topics for those assignments
  const assignmentIds = assignments.map(assignment => assignment.id);
  
  const { count, error } = await supabase
    .from('student_weak_topics')
    .select('id', { count: 'exact', head: true })
    .in('assignment_id', assignmentIds);
  
  if (error) throw error;
  return count || 0;
}

// Recommendations
export async function getPersonalizedRecommendations(studentId: string) {
  const { data, error } = await supabase
    .from('personalized_recommendations')
    .select('*, student_weak_topics(topic_name)')
    .eq('student_id', studentId);
  
  if (error) throw error;
  return data;
}

export async function getTeacherRecommendationsCount(teacherId: string) {
  // First get all classrooms for the teacher
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', teacherId);
  
  if (classroomsError) throw classroomsError;
  
  if (!classrooms || classrooms.length === 0) {
    return 0;
  }
  
  // Get all students in these classrooms
  const classroomIds = classrooms.map(classroom => classroom.id);
  
  const { data: students, error: studentsError } = await supabase
    .from('classroom_members')
    .select('student_id')
    .in('classroom_id', classroomIds);
  
  if (studentsError) throw studentsError;
  
  if (!students || students.length === 0) {
    return 0;
  }
  
  // Count recommendations for those students
  const studentIds = [...new Set(students.map(s => s.student_id))]; // Deduplicate
  
  const { count, error } = await supabase
    .from('personalized_recommendations')
    .select('id', { count: 'exact', head: true })
    .in('student_id', studentIds);
  
  if (error) throw error;
  return count || 0;
}

// Learning Hub resources
export async function getVideoRecommendations(studentId: string) {
  const { data, error } = await supabase
    .from('personalized_recommendations')
    .select('*, student_weak_topics(topic_name)')
    .eq('student_id', studentId)
    .eq('recommendation_type', 'youtube_video');
  
  if (error) throw error;
  return data.map(rec => ({
    id: rec.id,
    title: rec.title,
    description: rec.description || '',
    topic: rec.student_weak_topics?.topic_name || 'General topic',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop', // Placeholder
    url: rec.url || '#',
    details: rec.details || {}
  }));
}

export async function getStudyPlans(studentId: string) {
  const { data, error } = await supabase
    .from('personalized_recommendations')
    .select('*, student_weak_topics(topic_name)')
    .eq('student_id', studentId)
    .eq('recommendation_type', 'study_plan_item');
  
  if (error) throw error;
  return data.map(rec => {
    const details = rec.details as any || {};
    return {
      id: rec.id,
      topic: rec.student_weak_topics?.topic_name || 'General topic',
      title: rec.title,
      description: rec.description || '',
      progress: details.progress || 0,
      totalSteps: details.totalSteps || 5,
      completedSteps: details.completedSteps || 0,
      nextStep: details.nextStep || 'Start study plan',
      estimatedTime: details.estimatedTime || '1 hour'
    };
  });
}

export async function getQuizzes(studentId: string) {
  const { data, error } = await supabase
    .from('personalized_recommendations')
    .select('*, student_weak_topics(topic_name)')
    .eq('student_id', studentId)
    .eq('recommendation_type', 'quiz');
  
  if (error) throw error;
  return data.map(rec => {
    const details = rec.details as any || {};
    return {
      id: rec.id,
      title: rec.title,
      topic: rec.student_weak_topics?.topic_name || 'General topic',
      description: rec.description || '',
      questions: details.questions || 10,
      difficulty: details.difficulty || 'Medium',
      estimatedTime: details.estimatedTime || '15 min',
      attempts: details.attempts || 0
    };
  });
}

export async function getLearningResources(studentId: string) {
  const { data, error } = await supabase
    .from('personalized_recommendations')
    .select('*, student_weak_topics(topic_name)')
    .eq('student_id', studentId)
    .eq('recommendation_type', 'resource_link');
  
  if (error) throw error;
  return data.map(rec => {
    const details = rec.details as any || {};
    return {
      id: rec.id,
      title: rec.title,
      topic: rec.student_weak_topics?.topic_name || 'General topic',
      description: rec.description || '',
      type: details.type || 'Article',
      url: rec.url || '#'
    };
  });
}

// Process webhook response from Make.com with AI analysis results
// Note: This function is provided as a reference for Make.com to implement
// Make.com should directly update the Supabase database with similar logic
export async function updateWeakTopicsFromAnalysis(
  submissionId: string, 
  weakTopics: Array<{
    topicName: string, 
    confidenceScore: number, 
    aiExplanation: string
  }>
) {
  try {
    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('student_id, assignment_id')
      .eq('id', submissionId)
      .single();
    
    if (submissionError) throw submissionError;
    
    // Delete existing weak topics for this submission to avoid duplicates
    const { error: deleteError } = await supabase
      .from('student_weak_topics')
      .delete()
      .eq('student_id', submission.student_id)
      .eq('assignment_id', submission.assignment_id);
    
    if (deleteError) throw deleteError;
    
    // Insert new weak topics
    const weakTopicsToInsert = weakTopics.map(topic => ({
      student_id: submission.student_id,
      assignment_id: submission.assignment_id,
      topic_name: topic.topicName,
      confidence_score: topic.confidenceScore,
      ai_explanation: topic.aiExplanation
    }));
    
    if (weakTopicsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('student_weak_topics')
        .insert(weakTopicsToInsert);
      
      if (insertError) throw insertError;
    }
    
    // Create recommendations based on weak topics (simplified version)
    for (const topic of weakTopics) {
      const { error: recommendationError } = await supabase
        .from('personalized_recommendations')
        .insert([{
          student_id: submission.student_id,
          student_weak_topic_id: null, // We don't have this ID, would need another query to get it
          recommendation_type: 'resource_link',
          title: `Learn ${topic.topicName} - Personalized Resource`,
          description: `This resource will help you understand ${topic.topicName} better.`,
          url: 'https://example.com',
          details: {
            progress: 0,
            totalSteps: 5,
            completedSteps: 0,
            questions: 10,
            difficulty: 'Medium',
            estimatedTime: '30 min',
            attempts: 0,
            nextStep: `Review ${topic.topicName} basics`,
            type: 'Article'
          }
        }]);
      
      if (recommendationError) throw recommendationError;
    }
    
    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ ai_analysis_status: 'completed' })
      .eq('id', submissionId);
    
    if (updateError) throw updateError;
    
    return { success: true };
    
  } catch (error) {
    console.error('Error updating weak topics from analysis:', error);
    
    // Update submission status to failed
    await supabase
      .from('submissions')
      .update({ ai_analysis_status: 'failed' })
      .eq('id', submissionId);
    
    return { success: false, error };
  }
}

// Function to handle Make.com webhook responses
export async function handleMakeWebhookResponse(data: any) {
  console.log('Raw webhook data received:', JSON.stringify(data));
  
  const { submissionId, status, weakTopics = [], feedback } = data;
  
  // Parse feedback if it exists as JSON string or direct object
  let parsedFeedback = null;
  if (feedback) {
    try {
      // Special case for Make.com format where feedback might be a stringified JSON
      if (typeof feedback === 'string') {
        try {
          parsedFeedback = JSON.parse(feedback);
          console.log('Successfully parsed feedback string:', parsedFeedback);
        } catch (jsonError) {
          // If JSON parsing fails, use the string directly
          console.log('Could not parse feedback as JSON, using as raw string');
          parsedFeedback = { text: feedback };
        }
      } else {
        // If feedback is already an object, use it directly
        parsedFeedback = feedback;
        console.log('Using feedback as object directly:', parsedFeedback);
      }
      
      // If parsedFeedback contains analyses, extract weak topics
      if (parsedFeedback && parsedFeedback.weakTopics) {
        weakTopics.push(...parsedFeedback.weakTopics);
      }
      
    } catch (error) {
      console.error('Error processing feedback:', error);
    }
  }
  
  if (!submissionId) {
    throw new Error('Missing submissionId in webhook response');
  }
  
  try {
    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('student_id, assignment_id')
      .eq('id', submissionId)
      .single();
    
    if (submissionError) throw submissionError;
    
    // Process weak topics if provided or derived from feedback
    if (Array.isArray(weakTopics) && weakTopics.length > 0) {
      // Delete existing weak topics first
      await supabase
        .from('student_weak_topics')
        .delete()
        .eq('student_id', submission.student_id)
        .eq('assignment_id', submission.assignment_id);
      
      // Insert new weak topics
      const weakTopicsToInsert = weakTopics.map(topic => ({
        student_id: submission.student_id,
        assignment_id: submission.assignment_id,
        topic_name: topic.topicName || topic.topic_name || topic.name || '',
        confidence_score: topic.confidenceScore || topic.confidence_score || topic.score || 50,
        ai_explanation: topic.aiExplanation || topic.ai_explanation || topic.explanation || 'Topic identified by AI'
      }));
      
      if (weakTopicsToInsert.length > 0) {
        await supabase
          .from('student_weak_topics')
          .insert(weakTopicsToInsert);
      }
    }
    
    // Store the feedback data in the submission record
    let updateData: any = {
      ai_analysis_status: status || 'completed'
    };
    
    // If we have parsed feedback, store it in the submission record
    if (parsedFeedback) {
      updateData.ai_feedback = parsedFeedback;
    }
    
    // For debugging - log the exact update we're trying to make
    console.log('Updating submission with:', JSON.stringify(updateData));
    
    // Update submission status
    const { data: updateResult, error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select();
      
    if (updateError) {
      console.error('Error updating submission:', updateError);
      throw updateError;
    }
    
    console.log('Successfully updated submission:', updateResult);
    
    return { success: true };
  } catch (error) {
    console.error('Error processing webhook response:', error);
    
    // Ensure we update status to failed if there's an error
    try {
      await supabase
        .from('submissions')
        .update({ ai_analysis_status: 'failed' })
        .eq('id', submissionId);
    } catch (updateError) {
      console.error('Failed to update status to failed:', updateError);
    }
    
    return { success: false, error };
  }
} 