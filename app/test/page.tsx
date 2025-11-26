'use client'

import { useState } from 'react';
import { usePdfParser } from '../hooks/usePdfParser';

export default function TestPage() {
  const [text, setText] = useState<string>('');
  const { parseFromFile, isParsing, parsedQuestions, error } = usePdfParser();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setText('');
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    try {
      await parseFromFile(file);
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PDF Parse Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File
            </label>
            <input 
              type="file" 
              name="file" 
              id="file"
              accept=".pdf" 
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isParsing}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors self-start"
          >
            {isParsing ? 'Parsing...' : 'Upload and Parse'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {parsedQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">Extracted Questions ({parsedQuestions.length})</h2>
          <div className="space-y-6">
            {parsedQuestions.map((q, i) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50">
                <div className="font-medium mb-2">{q.id}. {q.question}</div>
                <div className="pl-4 space-y-1">
                  {q.options?.map((opt: string, idx: number) => (
                    <div key={idx} className="text-sm text-gray-700">{opt}</div>
                  ))}
                </div>
                {q.answer && (
                  <div className="mt-3 text-sm font-semibold text-green-700">
                    Answer: {q.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
