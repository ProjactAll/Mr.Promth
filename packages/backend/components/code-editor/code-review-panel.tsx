"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface CodeReviewIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  file: string;
  line?: number;
  title: string;
  description: string;
  suggestion?: string;
}

interface CodeReviewResult {
  issues: CodeReviewIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  overallScore: number;
  recommendations: string[];
}

interface CodeReviewPanelProps {
  projectId: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}

export function CodeReviewPanel({ projectId, files }: CodeReviewPanelProps) {
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);

  const handleReview = async () => {
    try {
      setReviewing(true);
      setResult(null);

      const response = await fetch(`/api/projects/${projectId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files,
          focusAreas: ['security', 'performance', 'best-practices', 'bugs', 'readability'],
        }),
      });

      if (!response.ok) {
        throw new Error('Review failed');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Code review completed!');
    } catch (error) {
      console.error('Error reviewing code:', error);
      toast.error('Failed to review code');
    } finally {
      setReviewing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Code Review</h3>
          <Button
            onClick={handleReview}
            disabled={reviewing || files.length === 0}
            size="sm"
          >
            {reviewing ? 'Reviewing...' : 'Run Review'}
          </Button>
        </div>
        {result && (
          <div className="flex items-center gap-4 text-sm">
            <span className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}/100
            </span>
            <div className="flex gap-2">
              {result.summary.critical > 0 && (
                <span className="text-red-500">{result.summary.critical} critical</span>
              )}
              {result.summary.high > 0 && (
                <span className="text-orange-500">{result.summary.high} high</span>
              )}
              {result.summary.medium > 0 && (
                <span className="text-yellow-500">{result.summary.medium} medium</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!result && !reviewing && (
          <div className="text-center text-gray-500 py-8">
            Click "Run Review" to analyze your code
          </div>
        )}

        {reviewing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing code...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {result.issues.length === 0 ? (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                <p className="text-green-400"> No issues found! Great job!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold uppercase">
                          {issue.severity}
                        </span>
                        <h4 className="font-semibold">{issue.title}</h4>
                      </div>
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{issue.description}</p>
                    <div className="text-xs text-gray-400">
                      {issue.file}
                      {issue.line && `:${issue.line}`}
                    </div>
                    {issue.suggestion && (
                      <div className="mt-2 text-sm bg-gray-800 rounded p-2">
                        <span className="text-green-400"> Suggestion:</span> {issue.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
