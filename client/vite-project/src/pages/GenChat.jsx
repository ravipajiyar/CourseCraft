import ChatAI from '../components/ChatAI/ChatAI';
import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';

const GenChatPage = () => {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />
      <ChatAI />
    </div>
  );
};

export default GenChatPage;
