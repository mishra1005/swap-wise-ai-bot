
export interface Message {
  content: string;
  isBot: boolean;
  timestamp: string;
  component?: 'swap' | 'history';
}
