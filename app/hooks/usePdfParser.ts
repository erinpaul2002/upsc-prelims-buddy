'use client';

import { useState, useCallback } from 'react';
import { ParsedQuestion } from '../types/quiz';

interface UsePdfParserReturn {
  // State
  parsedQuestions: ParsedQuestion[];
  isParsing: boolean;
  error: string | null;
  
  // Actions
  parseFromFile: (file: File) => Promise<ParsedQuestion[]>;
  clearError: () => void;
}

export function usePdfParser(): UsePdfParserReturn {
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract text from PDF using pdfjs-dist legacy build (better mobile compatibility)
  const extractTextFromPdf = async (file: File): Promise<string> => {
    // Dynamic import legacy build for better browser compatibility
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Use legacy worker from CDN with .js extension for mobile compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  };

  const parseFromFile = useCallback(async (file: File): Promise<ParsedQuestion[]> => {
    console.log('parseFromFile called with file:', file.name, 'size:', file.size);
    setIsParsing(true);
    setError(null);
    
    try {
      // Step 1: Extract text from PDF in the browser
      console.log('Extracting text from PDF...');
      const pdfText = await extractTextFromPdf(file);
      console.log('PDF text extracted, length:', pdfText.length);
      console.log('First 500 chars of PDF text:', pdfText.substring(0, 500));
      
      if (!pdfText || pdfText.trim().length === 0) {
        setError('Could not extract text from PDF. The PDF might be image-based or empty.');
        return [];
      }
      
      // Step 2: Send text to API route for Gemini processing
      console.log('Sending text to extract-questions API...');
      const response = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: pdfText,
          fileName: file.name
        }),
      });
      
      const result = await response.json();
      console.log('API response:', result);
      
      if (!response.ok) {
        console.error('API error:', result.error);
        setError(result.error || 'Failed to extract questions');
        return [];
      }

      if (!result.structuredQuestions || result.structuredQuestions.length === 0) {
        console.error('No structured questions found in API response');
        setError('No questions found in the PDF');
        return [];
      }

      console.log('Setting parsed questions:', result.structuredQuestions.length);
      setParsedQuestions(result.structuredQuestions);
      return result.structuredQuestions;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to parse PDF';
      console.error('Error in parseFromFile:', e);
      setError(errorMessage);
      return [];
    } finally {
      setIsParsing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    parsedQuestions,
    isParsing,
    error,
    parseFromFile,
    clearError
  };
}
