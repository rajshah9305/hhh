'use client';

import { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const SandpackPreview = dynamic(() => import('@/components/SandpackPreview'), { ssr: false });

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [showSplit, setShowSplit] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'tests'>('code');
  const [currentStage, setCurrentStage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && !showSplit) {
      textareaRef.current.focus();
    }
  }, [showSplit]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    setShowSplit(true);
    setIsGenerating(true);
    setGeneratedCode('');
    setGeneratedTests('');
    setCurrentStage('Initializing...');
    setActiveTab('code');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let codeBuffer = '';
      let testBuffer = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.stage === 'code') {
              if (parsed.message) setCurrentStage(parsed.message);
              if (parsed.status === 'streaming' && parsed.content) {
                codeBuffer += parsed.content;
                setGeneratedCode(codeBuffer);
              } else if (parsed.status === 'complete') {
                setGeneratedCode(parsed.fullContent);
              }
            } else if (parsed.stage === 'test') {
              if (parsed.message) setCurrentStage(parsed.message);
              if (parsed.status === 'streaming' && parsed.content) {
                testBuffer += parsed.content;
                setGeneratedTests(testBuffer);
              } else if (parsed.status === 'complete') {
                setGeneratedTests(parsed.fullContent);
              }
            } else if (parsed.stage === 'done') {
              setCurrentStage('Complete!');
              toast.success('🎉 Application generated successfully!');
            } else if (parsed.stage === 'error') {
              throw new Error(parsed.error);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      toast.error(error.message || 'Generation failed. Please try again.');
      setShowSplit(false);
    } finally {
      setIsGenerating(false);
      setCurrentStage('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Component.jsx';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Component downloaded!');
  };

  const handleReset = () => {
    setShowSplit(false);
    setGeneratedCode('');
    setGeneratedTests('');
    setPrompt('');
    setActiveTab('code');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              R
            </div>
            <h1 className="text-xl font-semibold text-black">RAJ AI APP BUILDER</h1>
          </div>
          <a
            href="https://github.com/rajshah9305/NLPtoapp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input */}
        <div className={`transition-all duration-700 ease-in-out ${showSplit ? 'w-[35%]' : 'w-full'}`}>
          <div className={`h-full flex items-center justify-center p-6 transition-all duration-700 ${showSplit ? 'items-start pt-12' : ''}`}>
            <div className={`w-full transition-all duration-700 ${showSplit ? 'max-w-none' : 'max-w-2xl'}`}>
              <div className="space-y-4">
                {!showSplit && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-4xl font-bold text-black mb-3">
                        Build React Apps with AI
                      </h2>
                      <p className="text-gray-600 text-lg">
                        Describe your application and watch it come to life
                      </p>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleGenerate();
                        }
                      }}
                      placeholder="Describe the React application you want to build...&#10;&#10;Example: Create a todo list with drag and drop, dark mode toggle, and local storage persistence"
                      className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-black placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      Generate App
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Enter</kbd> to generate
                    </p>
                  </>
                )}
                {showSplit && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 font-medium">Your Prompt</div>
                      <button
                        onClick={handleReset}
                        className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        ← New Prompt
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                      {prompt}
                    </div>
                    {isGenerating && currentStage && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-orange-700 font-medium">{currentStage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className={`border-l border-gray-200 bg-gray-50 transition-all duration-700 ease-in-out overflow-hidden ${showSplit ? 'w-[65%] opacity-100' : 'w-0 opacity-0'}`}>
          <div className="h-full flex flex-col">
            {/* Tabs Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-700">Generated Application</div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    disabled={!generatedCode}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy Code
                  </button>
                  <button 
                    onClick={handleDownload}
                    disabled={!generatedCode}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'code' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  disabled={!generatedCode}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'preview' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  disabled={!generatedTests}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'tests' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Tests
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'code' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <pre className="p-4 text-sm text-gray-800 font-mono overflow-x-auto">
                    <code>{generatedCode || 'Waiting for code generation...'}</code>
                  </pre>
                </div>
              )}
              {activeTab === 'preview' && generatedCode && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[calc(100vh-200px)]">
                  <SandpackPreview code={generatedCode} />
                </div>
              )}
              {activeTab === 'tests' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <pre className="p-4 text-sm text-gray-800 font-mono overflow-x-auto">
                    <code>{generatedTests || 'Waiting for test generation...'}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
