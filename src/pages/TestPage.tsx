import React from 'react';

const TestPage = () => {
  console.log('🧪 Test page loaded');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="text-muted-foreground">If you can see this, the basic routing is working.</p>
        <p className="text-sm text-muted-foreground mt-2">Check console for logs.</p>
      </div>
    </div>
  );
};

export default TestPage;

