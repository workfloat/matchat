import './css/matchat.css';
import MatChat from './js/matchat';

if (typeof window !== 'undefined') {
  (window as any).MatChat = MatChat;
}

export default MatChat;