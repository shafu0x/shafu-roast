import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from '@zdql/echo-react-sdk';

import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

import { fetchContractFromGithub } from '../utils/githubUtils';
import { ROASTER_SYSTEM_PROMPT, createRoastPrompt } from '../constants/prompts';

export function ContractRoaster() {
  const { isAuthenticated } = useEcho();
  const { openai } = useEchoOpenAI();
  const [githubUrl, setGithubUrl] = useState('');
  const [contractContent, setContractContent] = useState('');
  const [contractName, setContractName] = useState('');
  const [roast, setRoast] = useState('');
  const [fetchingContract, setFetchingContract] = useState(false);
  const [roasting, setRoasting] = useState(false);
  const [error, setError] = useState('');
  const roastContainerRef = useRef<HTMLDivElement>(null);

  const fetchContract = async () => {
    setFetchingContract(true);
    setError('');
    setContractContent('');
    setContractName('');
    setRoast('');

    try {
      const result = await fetchContractFromGithub(githubUrl);

      if (result.error) {
        setError(result.error);
        return;
      }

      setContractContent(result.content);
      setContractName(result.name);
    } catch (err: any) {
      setError(`❌ Failed to fetch contract: ${err.message}`);
    } finally {
      setFetchingContract(false);
    }
  };

  const generateRoast = async () => {
    if (!contractContent) return;

    setRoasting(true);
    setRoast(''); // Clear previous roast
    setError('');

    try {
      // Use streaming with better implementation
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `${ROASTER_SYSTEM_PROMPT}

${createRoastPrompt(contractName, contractContent)}`,
          },
        ],
        max_tokens: 1500,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          // Force immediate update using flushSync
          flushSync(() => {
            setRoast(prev => prev + content);
          });

          // Auto-scroll to bottom
          if (roastContainerRef.current) {
            roastContainerRef.current.scrollTop =
              roastContainerRef.current.scrollHeight;
          }

          // Small delay to create visible streaming effect
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }
    } catch (err: any) {
      setError('Failed to generate roast: ' + err.message);
    } finally {
      setRoasting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              🔥 shafu Roast 🔥
            </CardTitle>
            <CardDescription>
              Your contracts suck and I will tell you why
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <EchoSignIn />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-orange-500/20 bg-black/40 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              🔥 shafu Roast 🔥
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Submit your Solidity contracts for a ruthless code review
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Section */}
        <Card className="border-orange-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Solidity Contract</CardTitle>
            <CardDescription>
              Paste a direct GitHub link to a .sol file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/user/repo/blob/main/contracts/Token.sol"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={fetchContract}
                disabled={fetchingContract || !githubUrl}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {fetchingContract ? 'Fetching...' : 'Fetch Contract'}
              </Button>
            </div>

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Contract Found */}
        {contractContent && (
          <Card className="border-green-500/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-400"
                  >
                    {contractName}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    ({contractContent.split('\n').length} lines)
                  </span>
                </div>
                <Button
                  onClick={generateRoast}
                  disabled={roasting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {roasting ? (
                    <>
                      <span className="animate-pulse">🔥 Roasting...</span>
                    </>
                  ) : (
                    '🔥 ROAST IT! 🔥'
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={contractContent}
                readOnly
                className="min-h-[200px] max-h-[300px] bg-black/60 text-white border-green-500/30 font-mono text-xs"
              />
            </CardContent>
          </Card>
        )}

        {/* Roast Results */}
        {(roast || roasting) && (
          <Card className="border-red-500/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-red-400">🔥 THE ROAST 🔥</CardTitle>
              <CardDescription>
                {roasting
                  ? 'Analyzing your terrible code...'
                  : 'Prepare yourself for the truth...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={roastContainerRef}
                className="min-h-[400px] max-h-[600px] overflow-y-auto bg-black/60 text-white border border-red-500/30 rounded-md p-4 font-mono text-sm leading-relaxed scroll-smooth"
              >
                <pre className="whitespace-pre-wrap">
                  {roast}
                  {roasting && (
                    <span className="inline-block w-2 h-4 bg-red-500 typing-cursor ml-1" />
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
