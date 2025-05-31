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

// Assignments
export async function createAssignment(
  classroomId: string,
  title: string,
  description: string | null,
  subjectTopic: string | null,
  fileUrl: string | null,
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
    .eq('classroom_id', classroomId);
  
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
    .in('classroom_id', classroomIds);
  
  if (error) throw error;
  return data;
}

// Submissions
export async function createSubmission(
  assignmentId: string,
  studentId: string,
  contentText?: string | null,
  fileUrl?: string | null
) {
  const { data, error } = await supabase
    .from('submissions')
    .insert([{ 
      assignment_id: assignmentId,
      student_id: studentId,
      content_text: contentText,
      file_url: fileUrl
    }])
    .select()
    .single();
  
  if (error) throw error;
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
    .eq('assignment_id', assignmentId);
  
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
    .select('id')
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
      submitted_at,
      ai_analysis_status,
      assignments(title),
      users(full_name)
    `)
    .in('assignment_id', assignmentIds)
    .order('submitted_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
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