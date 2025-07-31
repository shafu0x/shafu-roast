import { EchoProvider } from '@zdql/echo-react-sdk';

import { ContractRoaster } from './components/ContractRoaster';
import { echoConfig } from './constants/config';

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ContractRoaster />
    </EchoProvider>
  );
}

export default App;
