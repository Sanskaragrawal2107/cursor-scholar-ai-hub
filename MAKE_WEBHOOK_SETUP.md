# Make.com Webhook Setup Guide

This document explains how to set up the Make.com webhook integration for PDF analysis in the Scholar AI Hub application.

## Overview

The PDF analysis workflow works as follows:

1. When a teacher clicks "Analyse with AI" on a submission, both the assignment PDF and student submission PDF are sent to a Make.com webhook.
2. Make.com processes these PDFs (using AI services for analysis).
3. Make.com updates the student's weak topics and creates personalized recommendations directly in your Supabase database.

## Important Notes

- Teachers can click "Analyse with AI" any number of times for a submission
- There are no "processing" or "pending" states that prevent re-analysis
- Each analysis may produce different results as the AI evaluates the PDFs

## Setting Up the Make.com Scenario

1. **Create a new scenario in Make.com**:
   - Log in to your Make.com account
   - Click "Create a new scenario"
   - Select "HTTP" > "Custom webhook" as your trigger

2. **Set up the webhook trigger**:
   - This will generate a webhook URL (like the one you provided: https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu)
   - Configure it to accept JSON data
   - Add sample data that includes:
     ```json
     {
       "submissionId": "123",
       "studentId": "456",
       "assignmentId": "789",
       "assignmentPdfUrl": "https://example.com/assignment.pdf",
       "studentSubmissionPdfUrl": "https://example.com/submission.pdf",
       "directAnalysis": true,
       "callbackUrl": "https://yourdomain.com/api/webhook/make"
     }
     ```

3. **Add modules to process the PDFs**:
   - Add an HTTP module to download both PDFs
   - Add AI processing modules depending on your needs (e.g., GPT analysis, PDF text extraction)
   - Process the content to identify weak topics

4. **Critical: Send Analysis Results Back**:

   There are two ways to send the results back to the application:

   ### Option 1: Direct Response (Preferred)
   Return the analysis results in the JSON response from the webhook with a 'feedback' field:
   ```json
   {
     "feedback": {
       "weakTopics": [
         {
           "name": "Topic 1",
           "score": 45,
           "explanation": "Explanation 1"
         },
         {
           "name": "Topic 2", 
           "score": 60,
           "explanation": "Explanation 2"
         }
       ],
       "summary": "The student shows strengths in X but needs improvement in Y...",
       "recommendations": ["Recommendation 1", "Recommendation 2"]
     }
   }
   ```

   ### Option 2: Update Database Directly
   Or use Supabase modules to update the database:
   - First run a DELETE operation to remove existing weak topics for this student/assignment combination:
     ```sql
     DELETE FROM student_weak_topics 
     WHERE student_id = '{{1.studentId}}' 
     AND assignment_id = '{{1.assignmentId}}'
     ```
   - Next insert new weak topics with an INSERT operation:
     ```sql
     INSERT INTO student_weak_topics (student_id, assignment_id, topic_name, confidence_score, ai_explanation)
     VALUES 
     ('{{1.studentId}}', '{{1.assignmentId}}', 'Topic 1', 45, 'Explanation 1'),
     ('{{1.studentId}}', '{{1.assignmentId}}', 'Topic 2', 60, 'Explanation 2')
     ```
   - Finally, update the submission status to 'completed' with an UPDATE operation:
     ```sql
     UPDATE submissions 
     SET ai_analysis_status = 'completed',
         ai_feedback = '{"weakTopics": [{"name": "Topic 1", "score": 45}]}'
     WHERE id = '{{1.submissionId}}'
     ```

## Example Make.com Scenario Flow

Set up your Make.com scenario with these steps:

1. **Webhook Trigger**: Receives submission and assignment PDF URLs
2. **HTTP Get**: Download both PDFs
3. **PDF Parser**: Extract text from PDFs
4. **AI Tool (ChatGPT/Claude)**: Analyze PDFs and identify weak topics
5. **JSON Aggregator**: Format results into a 'feedback' object
6. **Return Direct Response**: Return the feedback in the webhook response JSON
   
   OR
   
7. **Supabase Operations**: Update the database directly with the analysis results

## Testing the Integration

1. Log in as a teacher
2. Navigate to the Dashboard
3. Find a submission with a PDF
4. Click "Analyse with AI" button
5. Check the Make.com scenario execution logs
6. Verify that the status in Supabase changes from 'processing' to 'completed'
7. Verify that the "Feedback Available" badge appears on the submission
8. You can click "Analyse with AI" multiple times for different analyses

## Troubleshooting

- If the analysis status doesn't update and stays as "processing", check:
  1. Make.com scenario execution history - look for errors
  2. Make sure your feedback JSON is properly formatted
  3. Check browser console for errors processing the feedback
- If the "Feedback Available" badge doesn't appear, check that your feedback JSON is properly formatted in the 'feedback' field of your response
- If you use Option 2 (direct database updates), make sure your SQL operations are correctly formatting the submission ID, student ID, and assignment ID

## Configuring Your Application

1. Update the webhook URL in your application code (src/lib/api.ts):
   ```typescript
   const webhookUrl = 'https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu';
   ```

2. No need to run a separate server. Make sure to complete step 4 above to properly update the database! 