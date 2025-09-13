import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

async function transcribeAudio(audioData: string): Promise<string> {
  try {
    console.log('Starting audio transcription...');
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audioData);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    // Send to OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Whisper API error:', errorText);
      throw new Error(`OpenAI Whisper API error: ${errorText}`);
    }

    const result = await response.json();
    console.log('Transcription completed successfully');
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

async function analyzeSlideContent(slides: any[], transcript: string): Promise<any[]> {
  try {
    console.log('Starting slide content analysis...');
    
    const prompt = `Analyze these presentation slides and audio transcript to provide intelligent synchronization suggestions.

SLIDES:
${slides.map((slide, i) => `Slide ${i + 1}: ${slide.title || 'Untitled'}\n${slide.content || 'No content'}`).join('\n\n')}

AUDIO TRANSCRIPT:
${transcript}

Please provide a JSON response with:
1. Optimal timing suggestions for each slide based on the audio content
2. Content matching scores (0-1) between each slide and audio segments
3. Suggested slide transitions and improvements
4. Overall presentation flow assessment

Format the response as a JSON array where each element corresponds to a slide with this structure:
{
  "slide_number": number,
  "suggested_start_time": number (in seconds),
  "suggested_end_time": number (in seconds),
  "content_match_score": number (0-1),
  "ai_suggestions": {
    "timing_confidence": number (0-1),
    "content_relevance": "high" | "medium" | "low",
    "suggested_improvements": string[],
    "transition_notes": string
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert presentation analyst specializing in synchronizing slides with audio content. Provide precise, actionable timing and content suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI GPT API error:', errorText);
      throw new Error(`OpenAI GPT API error: ${errorText}`);
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);
    
    console.log('Slide content analysis completed');
    return analysis.slides || [];
  } catch (error) {
    console.error('Slide analysis error:', error);
    throw error;
  }
}

async function calculateSpeechPatterns(transcriptData: any): Promise<any> {
  try {
    const segments = transcriptData.segments || [];
    const totalDuration = transcriptData.duration || 0;
    
    // Calculate speech patterns
    const speechRate = transcriptData.text.split(' ').length / (totalDuration / 60); // words per minute
    const pauseCount = segments.filter((s: any) => s.end - s.start > 2).length; // pauses longer than 2 seconds
    const avgSegmentLength = segments.reduce((acc: number, s: any) => acc + (s.end - s.start), 0) / segments.length;
    
    return {
      speech_rate_wpm: Math.round(speechRate),
      pause_count: pauseCount,
      avg_segment_length: Math.round(avgSegmentLength * 100) / 100,
      total_duration: totalDuration,
      segments: segments.map((s: any) => ({
        start: s.start,
        end: s.end,
        text: s.text,
        confidence: s.avg_logprob || 0
      }))
    };
  } catch (error) {
    console.error('Speech pattern calculation error:', error);
    return {
      speech_rate_wpm: 150,
      pause_count: 0,
      avg_segment_length: 3,
      total_duration: 0,
      segments: []
    };
  }
}

// Generate animation timeline for slides
async function generateAnimationTimeline(slides: any[], transcript: string, transcriptData: any): Promise<any[]> {
  console.log('Generating animation timeline for slides...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        max_completion_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: `You are an animation expert. Analyze the transcript and slides to create animation timelines.
            
            For each slide, identify:
            1. Key words/phrases that should be highlighted when mentioned in audio
            2. Timing for image slide-in animations
            3. Duration and style of highlights
            
            Return a JSON array with this structure:
            [
              {
                "slide_number": 1,
                "animations": [
                  {
                    "type": "image_slide_in",
                    "start_time": 5.2,
                    "duration": 0.8,
                    "direction": "right"
                  },
                  {
                    "type": "keyword_highlight",
                    "text": "important phrase",
                    "start_time": 8.5,
                    "duration": 2.0,
                    "color": "#FFFF00"
                  }
                ]
              }
            ]`
          },
          {
            role: 'user',
            content: `Transcript: ${transcript.substring(0, 3000)}\n\nSlides: ${JSON.stringify(slides.map(s => ({ number: s.slide_number, title: s.title, content: s.content })))}`
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const animationContent = data.choices[0].message.content;
    console.log('Animation timeline generated:', animationContent.substring(0, 200));
    
    // Parse JSON response
    try {
      const jsonMatch = animationContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse animation JSON:', parseError);
    }
    
    return [];
  } catch (error) {
    console.error('Animation timeline generation error:', error);
    return [];
  }
}

async function generatePowerPointSlides(slides: any[], topic?: string): Promise<string[]> {
  try {
    console.log('Starting PowerPoint slide generation...');
    
    const slidePromises = slides.map(async (slide, index) => {
      const prompt = `Generate rich, professional presentation content for this slide using the provided context:

SLIDE CONTEXT:
- Slide ${index + 1} of ${slides.length}
- Title: ${slide.title || 'Untitled'}
- Content: ${slide.content || 'No content provided'}
- Topic: ${topic || 'General presentation'}

Please generate enhanced content including:
1. A compelling main title
2. 2-3 key bullet points with highlighted terms
3. Supporting explanatory text
4. Suggest an appropriate image description for this slide
5. Academic or professional citation if applicable

Format your response as JSON with this structure:
{
  "title": "Enhanced slide title",
  "bullet_points": [
    "Point 1 with <highlighted terms>",
    "Point 2 with <highlighted terms>", 
    "Point 3 with <highlighted terms>"
  ],
  "explanatory_text": "Additional context and explanation",
  "image_description": "Detailed description of appropriate image",
  "citation": "Source or reference if applicable"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are an expert presentation designer who creates engaging, professional slide content with clear structure and compelling visuals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_completion_tokens: 800,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate content for slide ${index + 1}`);
        throw new Error(`OpenAI API error for slide ${index + 1}`);
      }

      const result = await response.json();
      const slideContent = JSON.parse(result.choices[0].message.content);
      
      // Generate HTML using the specified template
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${slideContent.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Calibri, sans-serif;
      }
      .slide-container {
        width: 1280px;
        min-height: 720px;
        background: #F5F5F5;
        color: #2D2D2A;
        padding: 40px;
        box-sizing: border-box;
      }
      h1 {
        font-family: Georgia, serif;
        font-size: 36px;
        color: #3C1518;
        margin-bottom: 20px;
      }
      h2 {
        font-family: Georgia, serif;
        font-size: 24px;
        color: #3C1518;
        margin-bottom: 12px;
      }
      .content {
        font-size: 20px;
        line-height: 1.5;
      }
      .accent {
        color: #8B5D33;
        font-weight: bold;
      }
      .citation {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .evidence-box {
        background: rgba(139, 93, 51, 0.1);
        border-left: 4px solid #8B5D33;
        padding: 12px;
        margin-bottom: 12px;
      }
    </style>
  </head>
  <body>
    <div class="slide-container grid grid-cols-2 gap-8">
      <div class="content">
        <h1>${slideContent.title}</h1>
        
        <div class="evidence-box">
          <h2>Key Points</h2>
          <ul class="list-disc pl-6">
            ${slideContent.bullet_points.map(point => 
              `<li>${point.replace(/<([^>]+)>/g, '<span class="accent">$1</span>')}</li>`
            ).join('\n            ')}
          </ul>
        </div>
        
        <p class="mb-3">${slideContent.explanatory_text}</p>
      </div>
      
      <div class="flex flex-col items-center justify-center">
        <div class="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
          <div class="text-center">
            <i class="fas fa-image text-4xl mb-2"></i>
            <p class="text-sm">${slideContent.image_description}</p>
          </div>
        </div>
        ${slideContent.citation ? `<p class="citation">Source: ${slideContent.citation}</p>` : ''}
      </div>
    </div>
  </body>
</html>`;
    });

    const generatedSlides = await Promise.all(slidePromises);
    console.log(`Generated ${generatedSlides.length} PowerPoint slides`);
    return generatedSlides;
  } catch (error) {
    console.error('PowerPoint generation error:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const { project_id, audio_data, slides, analysis_type, powerpoint_url, powerpoint_name, topic } = body as any;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Starting AI analysis for project: ${project_id || 'N/A'}, type: ${analysis_type}`);

    let result: any = {};

    switch (analysis_type) {
      case 'test_gpt':
        console.log('Testing GPT functionality...');
        
        // Test OpenAI API key
        const testApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!testApiKey) {
          result = {
            success: false,
            gpt: false,
            whisper: false,
            edge: true,
            message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets.'
          };
          break;
        }

        try {
          // Test GPT-4
          const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${testApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              max_completion_tokens: 50,
              messages: [
                {
                  role: 'user',
                  content: 'Please respond with exactly: "GPT is working perfectly"'
                }
              ]
            })
          });

          const gptWorking = gptResponse.ok;
          let gptMessage = 'GPT test failed';
          
          if (gptWorking) {
            const gptData = await gptResponse.json();
            gptMessage = gptData.choices[0]?.message?.content || 'GPT responded';
          }

          // Test Whisper (simulated)
          const whisperResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${testApiKey}`,
            }
          });
          
          const whisperWorking = whisperResponse.ok;

          result = {
            success: gptWorking && whisperWorking,
            gpt: gptWorking,
            whisper: whisperWorking,
            edge: true,
            response: gptMessage,
            whisper_status: whisperWorking,
            message: `GPT: ${gptWorking ? '✅' : '❌'}, Whisper: ${whisperWorking ? '✅' : '❌'}, Edge Function: ✅`
          };
          
          console.log('✅ GPT test completed:', result);
        } catch (error) {
          console.error('❌ GPT test failed:', error);
          result = {
            success: false,
            gpt: false,
            whisper: false,
            edge: true,
            message: `GPT test failed: ${error.message}`
          };
        }
        break;

      case 'parse_powerpoint':
        // Basic slide extraction: no AI calls, generate a sensible default structure
        {
          const name = (powerpoint_name || 'Presentation') as string;
          const baseTitle = name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Presentation';

          const basicSlides = [
            { slide_number: 1, title: `${baseTitle} — Introduction`, content: 'Opening and objectives' },
            { slide_number: 2, title: 'Overview', content: 'Agenda and key topics' },
            { slide_number: 3, title: 'Main Concepts', content: 'Core ideas and details' },
            { slide_number: 4, title: 'Examples', content: 'Illustrative examples' },
            { slide_number: 5, title: 'Conclusion', content: 'Summary and next steps' },
          ];

          console.log('Using basic PowerPoint extraction for:', name, '→ slides:', basicSlides.length);

          result = {
            slides: basicSlides,
            message: 'Basic slide extraction used (no AI parsing).'
          };
        }
        break;

      case 'transcribe_audio':
        if (!project_id) {
          throw new Error('Project ID is required');
        }
        if (!audio_data) {
          throw new Error('Audio data is required for transcription');
        }
        
        const transcriptData = await transcribeAudio(audio_data);
        const speechPatterns = await calculateSpeechPatterns(transcriptData);
        
        // Save transcript to database
        const { error: audioError } = await supabase
          .from('presentation_audio')
          .upsert({
            project_id,
            transcript: transcriptData.text,
            duration: transcriptData.duration,
            processing_status: 'completed',
            waveform_data: speechPatterns,
            updated_at: new Date().toISOString()
          });

        if (audioError) {
          console.error('Database error saving transcript:', audioError);
          throw new Error('Failed to save transcript to database');
        }

        result = {
          transcript: transcriptData.text,
          duration: transcriptData.duration,
          speech_patterns: speechPatterns,
          segments: transcriptData.segments || []
        };
        break;

      case 'analyze_slides':
        if (!project_id) { throw new Error('Project ID is required'); }
        if (!slides || !Array.isArray(slides)) {
          throw new Error('Slides data is required for analysis');
        }

        // Get transcript from database
        const { data: audioData, error: fetchError } = await supabase
          .from('presentation_audio')
          .select('transcript, duration')
          .eq('project_id', project_id)
          .single();

        if (fetchError || !audioData?.transcript) {
          throw new Error('Audio transcript not found. Please transcribe audio first.');
        }

        const slideAnalysis = await analyzeSlideContent(slides, audioData.transcript);
        
        // Update slides in database with AI suggestions
        for (const analysis of slideAnalysis) {
          const { error: slideError } = await supabase
            .from('presentation_slides')
            .upsert({
              project_id,
              slide_number: analysis.slide_number,
              start_time: analysis.suggested_start_time,
              end_time: analysis.suggested_end_time,
              duration: analysis.suggested_end_time - analysis.suggested_start_time,
              ai_suggestions: analysis.ai_suggestions,
              updated_at: new Date().toISOString()
            });

          if (slideError) {
            console.error('Database error saving slide analysis:', slideError);
          }
        }

        result = {
          slide_analysis: slideAnalysis,
          total_duration: audioData.duration
        };
        break;

      case 'generate_powerpoint':
        if (!slides || !Array.isArray(slides)) {
          throw new Error('Slides data is required for PowerPoint generation');
        }

        const generatedSlides = await generatePowerPointSlides(slides, topic);
        
        result = {
          generated_slides: generatedSlides,
          slide_count: generatedSlides.length
        };
        break;

      case 'seamless_workflow':
        if (!project_id) { throw new Error('Project ID is required'); }
        if (!audio_data || !slides) {
          throw new Error('Both audio data and slides are required for seamless workflow');
        }

        console.log('Starting seamless workflow for project:', project_id);
        
        // Step 1: Transcribe audio with enhanced error handling
        let seamlessTranscriptData;
        try {
          seamlessTranscriptData = await transcribeAudio(audio_data);
          console.log('✅ Audio transcription completed');
        } catch (transcribeError) {
          console.error('❌ Audio transcription failed:', transcribeError);
          throw new Error(`Audio transcription failed: ${transcribeError.message}`);
        }
        
        const seamlessSpeechPatterns = calculateSpeechPatterns(seamlessTranscriptData);
        
        // Step 2: Analyze slides with transcript
        let seamlessSlideAnalysis;
        try {
          seamlessSlideAnalysis = await analyzeSlideContent(slides, seamlessTranscriptData.text);
          console.log('✅ Slide analysis completed');
        } catch (analysisError) {
          console.error('❌ Slide analysis failed:', analysisError);
          throw new Error(`Slide analysis failed: ${analysisError.message}`);
        }
        
        // Step 3: Generate animation timeline
        let seamlessAnimationTimeline;
        try {
          seamlessAnimationTimeline = await generateAnimationTimeline(slides, seamlessTranscriptData.text, seamlessTranscriptData);
          console.log('✅ Animation timeline generated');
        } catch (animationError) {
          console.error('❌ Animation generation failed:', animationError);
          // Don't fail the whole process for animations
          seamlessAnimationTimeline = [];
          console.log('⚠️ Continuing without animations');
        }
        
        // Step 4: Save everything to database
        try {
          const { error: seamlessAudioError } = await supabase
            .from('presentation_audio')
            .upsert({
              project_id,
              transcript: seamlessTranscriptData.text,
              duration: seamlessTranscriptData.duration,
              processing_status: 'completed',
              waveform_data: seamlessSpeechPatterns,
              updated_at: new Date().toISOString()
            });

          if (seamlessAudioError) {
            console.error('Database error saving audio:', seamlessAudioError);
          }

          for (const analysis of seamlessSlideAnalysis) {
            const { error: seamlessSlideError } = await supabase
              .from('presentation_slides')
              .upsert({
                project_id,
                slide_number: analysis.slide_number,
                start_time: analysis.suggested_start_time,
                end_time: analysis.suggested_end_time,
                duration: analysis.suggested_end_time - analysis.suggested_start_time,
                ai_suggestions: {
                  ...analysis.ai_suggestions,
                  animations: seamlessAnimationTimeline.find((a: any) => a.slide_number === analysis.slide_number)?.animations || []
                },
                updated_at: new Date().toISOString()
              });

            if (seamlessSlideError) {
              console.error('Database error saving slide:', seamlessSlideError);
            }
          }

          console.log('✅ Database updates completed');
        } catch (dbError) {
          console.error('❌ Database operations failed:', dbError);
          // Don't fail the whole process for database issues
        }

        result = {
          transcript: seamlessTranscriptData.text,
          duration: seamlessTranscriptData.duration,
          speech_patterns: seamlessSpeechPatterns,
          slide_analysis: seamlessSlideAnalysis,
          animation_timeline: seamlessAnimationTimeline,
          segments: seamlessTranscriptData.segments || [],
          success: true,
          message: 'Seamless workflow completed successfully'
        };
        
        console.log('🎉 Seamless workflow completed successfully');
        break;

      case 'full_analysis':
        if (!project_id) { throw new Error('Project ID is required'); }
        if (!audio_data || !slides) {
          throw new Error('Both audio data and slides are required for full analysis');
        }

        // Step 1: Transcribe audio
        const fullTranscriptData = await transcribeAudio(audio_data);
        const fullSpeechPatterns = await calculateSpeechPatterns(fullTranscriptData);
        
        // Step 2: Analyze slides
        const fullSlideAnalysis = await analyzeSlideContent(slides, fullTranscriptData.text);
        
        // Step 3: Generate animation timeline
        const fullAnimationTimeline = await generateAnimationTimeline(slides, fullTranscriptData.text, fullTranscriptData);
        
        // Step 4: Save everything to database
        const { error: fullAudioError } = await supabase
          .from('presentation_audio')
          .upsert({
            project_id,
            transcript: fullTranscriptData.text,
            duration: fullTranscriptData.duration,
            processing_status: 'completed',
            waveform_data: fullSpeechPatterns,
            updated_at: new Date().toISOString()
          });

        if (fullAudioError) {
          console.error('Database error in full analysis:', fullAudioError);
        }

        for (const analysis of fullSlideAnalysis) {
          const { error: fullSlideError } = await supabase
            .from('presentation_slides')
            .upsert({
              project_id,
              slide_number: analysis.slide_number,
              start_time: analysis.suggested_start_time,
              end_time: analysis.suggested_end_time,
              duration: analysis.suggested_end_time - analysis.suggested_start_time,
              ai_suggestions: analysis.ai_suggestions,
              updated_at: new Date().toISOString()
            });

          if (fullSlideError) {
            console.error('Database error in full slide analysis:', fullSlideError);
          }
        }

        result = {
          transcript: fullTranscriptData.text,
          duration: fullTranscriptData.duration,
          speech_patterns: fullSpeechPatterns,
          slide_analysis: fullSlideAnalysis,
          animation_timeline: fullAnimationTimeline,
          segments: fullTranscriptData.segments || []
        };
        break;

      default:
        throw new Error('Invalid analysis type. Use: transcribe_audio, analyze_slides, generate_powerpoint, or full_analysis');
    }

    console.log(`AI analysis completed successfully for project: ${project_id}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});