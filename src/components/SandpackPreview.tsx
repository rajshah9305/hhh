'use client';

import { Sandpack } from '@codesandbox/sandpack-react';

interface SandpackPreviewProps {
  code: string;
}

function extractComponentName(code: string): string {
  // Match: function Name() or function Name ({
  const match = code.match(/^function\s+([A-Z][A-Za-z0-9]*)\s*[\({]/m);
  return match?.[1] ?? 'App';
}

export default function SandpackPreview({ code }: SandpackPreviewProps) {
  const componentName = extractComponentName(code);

  const wrappedCode = `import React from 'react';
import ReactDOM from 'react-dom/client';

${code}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<${componentName} />);`;

  return (
    <div className="h-full">
      <Sandpack
        template="react"
        theme="light"
        files={{
          '/App.js': wrappedCode,
          '/styles.css': `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.3.6/dist/tailwind.min.css');

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  height: 100vh;
}`,
        }}
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: true,
          editorHeight: '100%',
          editorWidthPercentage: 0,
        }}
      />
    </div>
  );
}
