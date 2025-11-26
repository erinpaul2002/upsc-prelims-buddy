'use client'

import { useState } from 'react';
import { parsePdf } from './actions';

export default function TestPage() {
  const [text, setText] = useState<string>('');
  const [savedFile, setSavedFile] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setText('');
    setSavedFile('');
    setQuestions([]);
    try {
      const result = await parsePdf(formData);
      if (result.text) {
        setText(result.text);
        if (result.savedToFile) {
          setSavedFile(result.savedToFile);
        }
        if (result.structuredQuestions) {
          setQuestions(result.structuredQuestions);
        }
      } else if (result.error) {
        alert(result.error);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PDF Parse Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form action={handleSubmit} className="flex flex-col gap-4">
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
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors self-start"
          >
            {loading ? 'Parsing...' : 'Upload and Parse'}
          </button>
        </form>
      </div>
      
      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">Extracted Questions ({questions.length})</h2>
          <div className="space-y-6">
            {questions.map((q, i) => (
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
      
      {text && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-bold text-lg">Parsed Content</h2>
            {savedFile && (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Saved to: {savedFile}
              </span>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded border overflow-auto max-h-[600px]">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">{text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
