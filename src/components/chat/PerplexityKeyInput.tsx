
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PerplexityKeyInputProps {
  onKeySubmit: (key: string) => void;
}

export const PerplexityKeyInput: React.FC<PerplexityKeyInputProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    localStorage.setItem('perplexity_api_key', apiKey);
    onKeySubmit(apiKey);
    toast.success('API key saved successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-dark-subtle rounded-lg mb-4">
      <p className="text-sm text-gray-300">
        Please enter your Perplexity API key to enable AI chat responses.
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Perplexity API key"
          className="flex-1"
        />
        <Button type="submit" variant="default">
          Save Key
        </Button>
      </div>
    </form>
  );
};
