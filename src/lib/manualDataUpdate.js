// Import Supabase client
import { supabase } from './supabase';

// Function to manually insert the provided data
export async function insertOSAssignmentWeakTopics() {
  // First, we need the real submission ID - replace this with your actual submission ID
  const submissionId = '73ac766e-9b5f-4398-a737-340ae8ddedb2'; // Use the first submission from our query
  
  try {
    // Get the submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('student_id, assignment_id')
      .eq('id', submissionId)
      .single();
    
    if (submissionError) {
      console.error('Error getting submission:', submissionError);
      return { success: false, error: submissionError };
    }
    
    // Delete existing weak topics for this submission
    const { error: deleteError } = await supabase
      .from('student_weak_topics')
      .delete()
      .eq('student_id', submission.student_id)
      .eq('assignment_id', submission.assignment_id);
      
    if (deleteError) {
      console.error('Error deleting existing topics:', deleteError);
      return { success: false, error: deleteError };
    }
    
    // Data from the provided JSON - these are the weak topics
    const weakTopics = [
      {
        "name": "Scheduling Algorithms (Preemptive vs Non-preemptive)",
        "score": 2,
        "explanation": "The student demonstrates a misunderstanding of preemptive and non-preemptive scheduling. Preemptive scheduling allows the OS to interrupt a running process, while non-preemptive scheduling requires a process to voluntarily release the CPU. The examples provided (Round Robin for non-preemptive and FCFS for preemptive) are incorrect."
      },
      {
        "name": "Scheduling Algorithms (FCFS, SJF) and Performance Metrics",
        "score": 1,
        "explanation": "The student incorrectly assumes processes execute randomly and fails to calculate waiting and turnaround times using Gantt charts. They demonstrate a lack of understanding of how scheduling algorithms affect these performance metrics."
      },
      {
        "name": "Deadlock Conditions and Handling",
        "score": 1,
        "explanation": "The student's understanding of deadlocks is flawed.  Deadlock occurrence is not solely based on RAM capacity, and the necessary conditions involve resource contention, not CPU speed and internet bandwidth. Rebooting and deleting processes are crude ways to handle deadlock and don't address prevention or avoidance strategies."
      },
      {
        "name": "Paging and Memory Translation",
        "score": 1,
        "explanation": "The student's explanation of paging is incorrect. Paging divides memory into fixed-size blocks (pages), not random-sized blocks. Logical addresses are not chosen directly by the CPU without translation. TLB's function is to cache page table entries for faster address translation, not to store passwords."
      },
      {
        "name": "Memory Allocation Algorithms (First-Fit, Best-Fit, Worst-Fit)",
        "score": 2,
        "explanation": "The descriptions of First-Fit, Best-Fit, and Worst-Fit algorithms are inaccurate.  The student confuses the allocation strategies for each algorithm. Correctly understanding how each selects a memory partition is crucial."
      },
      {
        "name": "Fragmentation (Internal vs External)",
        "score": 1,
        "explanation": "The student demonstrates a misunderstanding of internal and external fragmentation and how paging and segmentation relate to these issues. They have completely reversed the memory locations associated with them."
      },
      {
        "name": "Virtual Memory and Demand Paging",
        "score": 1,
        "explanation": "The student's understanding of virtual memory and demand paging is fundamentally incorrect. Virtual memory is not stored on the GPU; demand paging doesn't load entire programs. Handling page faults by reinstalling the OS is completely wrong."
      },
      {
        "name": "File Systems and Data Structures (Inodes)",
        "score": 1,
        "explanation": "The student lacks a basic understanding of file system organization. Files are not stored only in RAM, directories are more than just a list of filenames and inodes are not only used in Windows."
      },
      {
        "name": "Interprocess Synchronization (Mutexes and Semaphores)",
        "score": 1,
        "explanation": "The student has a very inaccurate understanding of mutexes and semaphores. They don't understand their use for interprocess synchronization and instead assign them irrelevant purposes."
      },
      {
        "name": "Context Switching",
        "score": 1,
        "explanation": "The student's description of context switching is highly inaccurate. Context switching saves the state of a process, not deletes it, and more context switches don't inherently lead to faster system performance (the overhead involved needs to be considered)."
      }
    ];
    
    // Format the topics for insertion
    const topicsToInsert = weakTopics.map(topic => ({
      student_id: submission.student_id,
      assignment_id: submission.assignment_id,
      topic_name: topic.name,
      confidence_score: topic.score,
      ai_explanation: topic.explanation
    }));
    
    // Insert the topics
    const { data, error: insertError } = await supabase
      .from('student_weak_topics')
      .insert(topicsToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting topics:', insertError);
      return { success: false, error: insertError };
    }
    
    // Also update the submission with the feedback
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        ai_analysis_status: 'completed',
        ai_feedback: {
          weakTopics: weakTopics,
          summary: "The student's submission demonstrates a significant lack of understanding of fundamental operating system concepts. The answers are largely incorrect and reveal confusion about the purpose and operation of key components like scheduling algorithms, memory management techniques, file systems, and synchronization primitives. The overall score is very low, indicating a need for a thorough review of the course material and potentially additional tutoring or clarification from the instructor."
        }
      })
      .eq('id', submissionId);
    
    if (updateError) {
      console.error('Error updating submission:', updateError);
      return { success: false, error: updateError };
    }
    
    return { 
      success: true, 
      message: `Successfully inserted ${topicsToInsert.length} weak topics for submission ${submissionId}` 
    };
  } catch (err) {
    console.error('Error in insertOSAssignmentWeakTopics:', err);
    return { success: false, error: err };
  }
}

// Export a function to run the update with proper error handling
export async function runManualUpdate() {
  try {
    const result = await insertOSAssignmentWeakTopics();
    console.log('Update result:', result);
    return result;
  } catch (error) {
    console.error('Fatal error running update:', error);
    return { success: false, error };
  }
} 