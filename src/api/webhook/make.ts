import { handleMakeWebhookResponse } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    console.log('Received webhook data from Make.com:', JSON.stringify(data));
    
    // Process the data
    if (!data.submissionId) {
      return new Response(JSON.stringify({ error: 'Missing submissionId in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // DIRECT UPDATE: If we're getting feedback directly from Make.com, update Supabase
    try {
      // First get the submission details to get student_id and assignment_id
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('student_id, assignment_id')
        .eq('id', data.submissionId)
        .single();
        
      if (submissionError) {
        console.error('Error fetching submission:', submissionError);
        throw submissionError;
      }
      
      let updateData: Record<string, any> = { 
        ai_analysis_status: data.status || 'completed',
      };
      
      // Process feedback - first convert to proper format if it's a string
      let parsedFeedback: any = null;
      let weakTopics: any[] = [];
      
      // Check if there's a feedback field and add it if present
      if (data.feedback) {
        try {
          // If feedback is a string (which it likely is from Make.com), try to parse it
          if (typeof data.feedback === 'string') {
            parsedFeedback = JSON.parse(data.feedback);
            console.log('Parsed feedback from string:', parsedFeedback);
          } else {
            parsedFeedback = data.feedback;
            console.log('Using feedback object directly:', parsedFeedback);
          }
          
          updateData.ai_feedback = parsedFeedback;
          
          // Extract weak topics from the parsed feedback
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
        } catch (parseError) {
          console.error('Error processing feedback:', parseError);
          // Even if parsing fails, create a topic from the raw string
          weakTopics = [{
            name: "Identified Topic",
            score: 50,
            explanation: String(data.feedback)
          }];
          
          // Store the raw feedback
          updateData.ai_feedback = { rawFeedback: data.feedback };
        }
      }
      
      console.log('Extracted weak topics:', weakTopics);
      
      // 1. Update the submission status
      const { error: updateError } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', data.submissionId);
        
      if (updateError) {
        console.error('Error updating submission:', updateError);
        throw updateError;
      }
      
      // 2. Add entries to student_weak_topics table if we have topics
      if (weakTopics.length > 0) {
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
      }
      
      console.log('Successfully updated submission directly in webhook handler');
    } catch (directUpdateError) {
      console.error('Failed direct update approach, trying handleMakeWebhookResponse:', directUpdateError);
      
      // Fall back to previous method if direct update fails
      await handleMakeWebhookResponse(data);
    }
    
    // Return a response
    return new Response(JSON.stringify({ success: true, message: 'Webhook processed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 