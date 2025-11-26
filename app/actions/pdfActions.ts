'use server'

// @ts-expect-error - importing directly from lib to avoid index.js execution
import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedPdfResult, ParsedQuestion } from '../types/quiz';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function parsePdf(formData: FormData): Promise<ParsedPdfResult> {
  const file = formData.get('file') as File;
  if (!file) {
    console.error('No file uploaded');
    return { error: 'No file uploaded' };
  }

  console.log('Starting PDF parse for file:', file.name, 'size:', file.size);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('PDF buffer created, size:', buffer.length);
    
    const data = await pdf(buffer);
    console.log('PDF parsed successfully. Text length:', data.text.length);
    console.log('First 500 chars of PDF text:', data.text.substring(0, 500));

    let structuredQuestions: ParsedQuestion[] = [];
    if (process.env.GEMINI_API_KEY) {
      console.log('Gemini API key found, attempting to extract questions');
      try {
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
          ${data.text}
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
        } else {
          const response = await result.response;
          const text = response.text();
          console.log('Gemini response text length:', text.length);
          console.log('Gemini response first 500 chars:', text.substring(0, 500));
          
          const jsonString = text.replace(/```json\n|\n```/g, '').trim();
          console.log('Cleaned JSON string length:', jsonString.length);
          console.log('Cleaned JSON string first 500 chars:', jsonString.substring(0, 500));
          
          structuredQuestions = JSON.parse(jsonString);
          console.log('Parsed structured questions:', structuredQuestions.length);
          console.log('First question sample:', structuredQuestions[0]);
        }
      } catch (e) {
        console.error("Gemini parsing failed:", e);
      }
    } else {
      console.warn('No Gemini API key found, skipping structured question extraction');
    }

    // Store parsed content in JSON
    const parsedData = {
      fileName: file.name,
      parsedAt: new Date().toISOString(),
      content: data.text,
      structuredQuestions
    };

    const dataDir = path.join(process.cwd(), 'parsed_data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const jsonFileName = `${path.parse(file.name).name}_${Date.now()}.json`;
    const filePath = path.join(dataDir, jsonFileName);
    
    await fs.writeFile(filePath, JSON.stringify(parsedData, null, 2));

    return { 
      text: data.text, 
      savedToFile: jsonFileName,
      structuredQuestions 
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return { error: 'Failed to parse PDF' };
  }
}

export async function loadParsedQuestions(fileName: string): Promise<ParsedPdfResult> {
  try {
    const dataDir = path.join(process.cwd(), 'parsed_data');
    const filePath = path.join(dataDir, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return {
      text: data.content,
      structuredQuestions: data.structuredQuestions
    };
  } catch (error) {
    console.error('Error loading parsed questions:', error);
    return { error: 'Failed to load questions' };
  }
}

export async function listParsedFiles(): Promise<string[]> {
  try {
    const dataDir = path.join(process.cwd(), 'parsed_data');
    const files = await fs.readdir(dataDir);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}
