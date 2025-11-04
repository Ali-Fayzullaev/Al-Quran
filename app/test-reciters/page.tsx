"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RECITERS, testReciterAvailability, getAyahAudioSources } from "@/lib/api";
import { Play, Check, X, Loader2 } from "lucide-react";

export default function TestRecitersPage() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const testReciter = async (reciterId: string) => {
    setTesting(reciterId);
    
    try {
      const sources = getAyahAudioSources(1, 1, reciterId);
      console.log(`Testing ${reciterId} with sources:`, sources);
      
      const isAvailable = await testReciterAvailability(reciterId);
      setTestResults(prev => ({ ...prev, [reciterId]: isAvailable }));
    } catch (error) {
      console.error(`Error testing ${reciterId}:`, error);
      setTestResults(prev => ({ ...prev, [reciterId]: false }));
    }
    
    setTesting(null);
  };

  const playReciter = async (reciterId: string) => {
    if (audio) {
      audio.pause();
    }

    const sources = getAyahAudioSources(1, 1, reciterId);
    const testAudio = new Audio();
    
    testAudio.onloadeddata = () => {
      testAudio.play().catch(console.error);
    };
    
    testAudio.onerror = () => {
      console.error(`Failed to play ${reciterId}`);
    };
    
    testAudio.src = sources[0];
    setAudio(testAudio);
  };

  const testAllReciters = async () => {
    for (const reciter of RECITERS) {
      await testReciter(reciter.id);
      // Небольшая пауза между тестами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--fixed-background)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--fixed-text-primary)' }}>
          🎵 Test Audio Reciters
        </h1>
        
        <div className="mb-6">
          <Button onClick={testAllReciters} className="mb-4">
            Test All Reciters
          </Button>
        </div>

        <div className="grid gap-4">
          {RECITERS.map((reciter) => (
            <div
              key={reciter.id}
              className="flex items-center justify-between p-4 border rounded-lg"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: 'var(--fixed-text-primary)' }}>
                  {reciter.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {reciter.id} • {reciter.country}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Test Status */}
                <div className="flex items-center gap-2">
                  {testing === reciter.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : testResults[reciter.id] !== undefined ? (
                    testResults[reciter.id] ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )
                  ) : null}
                </div>

                {/* Test Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testReciter(reciter.id)}
                  disabled={testing === reciter.id}
                >
                  Test
                </Button>

                {/* Play Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playReciter(reciter.id)}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results Summary:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>✅ Working: {Object.values(testResults).filter(Boolean).length}</div>
            <div>❌ Failed: {Object.values(testResults).filter(r => r === false).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}