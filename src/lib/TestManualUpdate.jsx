import React, { useState } from 'react';
import { supabase } from './supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestManualUpdate() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // The exact data from Make.com the user provided
  const testData = {
    "submissionId": "OS_Assignment_1",
    "status": "completed",
    "feedback": {
      "weakTopics": [
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
      ],
      "summary": "The student's submission demonstrates a significant lack of understanding of fundamental operating system concepts. The answers are largely incorrect and reveal confusion about the purpose and operation of key components like scheduling algorithms, memory management techniques, file systems, and synchronization primitives. The overall score is very low, indicating a need for a thorough review of the course material and potentially additional tutoring or clarification from the instructor."
    }
  };

  const updateDatabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get first submission to use as our target
      const { data: submissions, error: fetchError } = await supabase
        .from('submissions')
        .select('id, student_id, assignment_id')
        .limit(1);
      
      if (fetchError || !submissions || submissions.length === 0) {
        throw new Error(fetchError?.message || 'No submissions found');
      }
      
      const submission = submissions[0];
      console.log('Using submission:', submission);
      
      // Delete existing weak topics for this submission
      await supabase
        .from('student_weak_topics')
        .delete()
        .eq('student_id', submission.student_id)
        .eq('assignment_id', submission.assignment_id);
      
      // Format the topics for insertion
      const weakTopics = testData.feedback.weakTopics;
      
      const topicsToInsert = weakTopics.map(topic => ({
        student_id: submission.student_id,
        assignment_id: submission.assignment_id,
        topic_name: topic.name, 
        confidence_score: topic.score,
        ai_explanation: topic.explanation
      }));
      
      // Insert the topics
      const { data: insertedTopics, error: insertError } = await supabase
        .from('student_weak_topics')
        .insert(topicsToInsert);
      
      if (insertError) throw insertError;
      
      // Also update the submission with the feedback
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          ai_analysis_status: 'completed',
          ai_feedback: testData.feedback
        })
        .eq('id', submission.id);
      
      if (updateError) throw updateError;
      
      // Check if insertion was successful
      const { data: checkData, error: checkError } = await supabase
        .from('student_weak_topics')
        .select('*')
        .eq('student_id', submission.student_id)
        .eq('assignment_id', submission.assignment_id);
      
      setResult({
        success: true,
        message: `Successfully inserted ${weakTopics.length} topics`,
        topicsInDatabase: checkData?.length || 0
      });
    } catch (err) {
      console.error('Error updating database:', err);
      setError(err.message);
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Database Update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Click the button to manually insert the OS Assignment topics into the database using the first submission in your database.</p>
        
        <Button 
          onClick={updateDatabase}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Database'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {result && result.success && (
          <div className="p-4 bg-green-50 text-green-800 rounded-md">
            {result.message}
            <p>Found {result.topicsInDatabase} topics in the database after update.</p>
          </div>
        )}
        
        <div className="text-sm">
          <p className="font-bold">Using this test data:</p>
          <pre className="bg-gray-100 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
} 