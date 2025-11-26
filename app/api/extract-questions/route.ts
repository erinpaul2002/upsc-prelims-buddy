import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedQuestion } from '../../types/quiz';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, fileName } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    console.log('Received text for processing, length:', text.length);
    console.log('File name:', fileName);

    let structuredQuestions: ParsedQuestion[] = [];
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('No GEMINI_API_KEY environment variable set');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('Gemini API key found, attempting to extract questions');
    
    const prompt = `
      Extract ALL multiple choice questions from the following text. 
      Return ONLY a valid JSON array of objects. 
      Each object should have:
      - "id": number (starting from 1)
      - "question": string (the full question text)
      - "options": array of strings (the choices, include option letter like "A. ", "B. " etc)
      - "answer": string (the correct option letter like "A", "B", "C", "D" if available, otherwise null)
      
      IMPORTANT: Extract EVERY question you find in the text. Do not skip any questions.
      If there are many questions, include all of them in the array.
      
      Text to process:
      ${text}
    `;
    
    let result;
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-2.5-flash", 
      "gemini-2.0-flash-lite",
      "gemini-flash-latest"
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log('Trying model:', modelName);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        console.log('Model', modelName, 'succeeded');
        break;
      } catch (e) {
        console.warn(`Model ${modelName} failed:`, (e as Error).message);
      }
    }

    if (!result) {
      console.error("All Gemini models failed to generate content");
      return NextResponse.json({ error: 'Failed to extract questions - AI service unavailable' }, { status: 500 });
    }

    const response = await result.response;
    const responseText = response.text();
    console.log('Gemini response text length:', responseText.length);
    
    // Clean up the response - remove markdown code blocks
    let jsonString = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON array in the response
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    console.log('Cleaned JSON string length:', jsonString.length);
    
    try {
      structuredQuestions = JSON.parse(jsonString);
      console.log('Parsed structured questions:', structuredQuestions.length);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', responseText.substring(0, 1000));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ 
      structuredQuestions,
      questionCount: structuredQuestions.length
    });
    
  } catch (error) {
    console.error('Error in extract-questions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
