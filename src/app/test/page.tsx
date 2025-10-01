"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { realDlmmService } from "@/services/dlmm-real";

export default function TestPage() {
  const [dlmmResults, setDlmmResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDLMM = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Testing DLMM connection...");

      // Test the real DLMM service
      const testResults = await realDlmmService.testConnection();
      setDlmmResults(testResults);

      console.log("DLMM Test Results:", testResults);
    } catch (err) {
      console.error("DLMM test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>DLMM Service Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testDLMM} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test DLMM Connection"}
            </Button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            {dlmmResults && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(dlmmResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
