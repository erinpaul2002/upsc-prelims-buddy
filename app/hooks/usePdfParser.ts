import { useState, useCallback } from 'react';
import { parsePdf, loadParsedQuestions, listParsedFiles } from '../actions/pdfActions';
import { ParsedQuestion } from '../types/quiz';

interface UsePdfParserReturn {
  // State
  parsedQuestions: ParsedQuestion[];
  isParsing: boolean;
  error: string | null;
  savedFiles: string[];
  
  // Actions
  parseFromFile: (file: File) => Promise<ParsedQuestion[]>;
  loadFromSaved: (fileName: string) => Promise<ParsedQuestion[]>;
  refreshSavedFiles: () => Promise<void>;
  clearError: () => void;
}

export function usePdfParser(): UsePdfParserReturn {
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);

  const parseFromFile = useCallback(async (file: File): Promise<ParsedQuestion[]> => {
    console.log('parseFromFile called with file:', file.name, 'size:', file.size);
    setIsParsing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('Calling parsePdf action');
      const result = await parsePdf(formData);
      console.log('parsePdf result:', result);
      
      if (result.error) {
        console.error('parsePdf returned error:', result.error);
        setError(result.error);
        return [];
      }

      if (!result.structuredQuestions || result.structuredQuestions.length === 0) {
        console.error('No structured questions found. Result:', result);
        console.error('PDF text length:', result.text?.length);
        console.error('First 1000 chars of PDF text:', result.text?.substring(0, 1000));
        setError('No questions found in the PDF');
        return [];
      }

      console.log('Setting parsed questions:', result.structuredQuestions.length);
      setParsedQuestions(result.structuredQuestions);
      console.log('Parsed questions from PDF:', result.structuredQuestions.length);
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

  const loadFromSaved = useCallback(async (fileName: string): Promise<ParsedQuestion[]> => {
    setIsParsing(true);
    setError(null);
    
    try {
      const result = await loadParsedQuestions(fileName);
      
      if (result.error) {
        setError(result.error);
        return [];
      }

      if (!result.structuredQuestions || result.structuredQuestions.length === 0) {
        setError('No questions found in the saved file');
        return [];
      }

      setParsedQuestions(result.structuredQuestions);
      return result.structuredQuestions;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load questions';
      setError(errorMessage);
      return [];
    } finally {
      setIsParsing(false);
    }
  }, []);

  const refreshSavedFiles = useCallback(async () => {
    try {
      const files = await listParsedFiles();
      setSavedFiles(files);
    } catch {
      setSavedFiles([]);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    parsedQuestions,
    isParsing,
    error,
    savedFiles,
    parseFromFile,
    loadFromSaved,
    refreshSavedFiles,
    clearError
  };
}
