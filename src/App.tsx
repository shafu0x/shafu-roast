import {
  EchoProvider,
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from '@zdql/echo-react-sdk';
import { useState } from 'react';

const echoConfig = {
  appId: process.env.REACT_APP_ECHO_APP_ID!,
  apiUrl: process.env.REACT_APP_ECHO_API_URL!,
};

function ChatInterface() {
  const { isAuthenticated } = useEcho()
  const { openai } = useEchoOpenAI()
  const [response, setResponse] = useState('')
  const [input, setInput] = useState('')

  const getMessage = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: input }],
    })
    setResponse(response.choices[0].message.content || '')
  }
  
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '.5rem',
      height: '50vh',
    }}>
      {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={getMessage}>Send Message</button>
      <p>{response}</p>
    </div>
  );
}

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ChatInterface />
    </EchoProvider>
  );
}

export default App;
