
import { WalletConnection } from '@/components/WalletConnection';
import { ChatInterface } from '@/components/chat/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-dark text-white">
      <WalletConnection />
      <ChatInterface />
    </div>
  );
};

export default Index;
