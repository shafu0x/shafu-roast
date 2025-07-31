import {
  EchoProvider,
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from '@zdql/echo-react-sdk';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Octokit } from 'octokit';

const echoConfig = {
  appId: process.env.REACT_APP_ECHO_APP_ID!,
  apiUrl: process.env.REACT_APP_ECHO_API_URL!,
};

interface ContractFile {
  name: string;
  content: string;
  path: string;
}

function ContractRoaster() {
  const { isAuthenticated } = useEcho();
  const { openai } = useEchoOpenAI();
  const [githubUrl, setGithubUrl] = useState('');
  const [contracts, setContracts] = useState<ContractFile[]>([]);
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseGithubUrl = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('Invalid GitHub URL');
      return { owner: match[1], repo: match[2].replace('.git', '') };
    } catch {
      throw new Error('Please provide a valid GitHub repository URL');
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    setContracts([]);
    setRoast('');

    try {
      const { owner, repo } = parseGithubUrl(githubUrl);
      const octokit = new Octokit();

      // Get repository contents recursively
      const { data: contents } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
      });

      const contractFiles: ContractFile[] = [];

      // Function to recursively search for .sol files
      const searchSolFiles = async (items: any[], currentPath = '') => {
        for (const item of items) {
          if (item.type === 'file' && item.name.endsWith('.sol')) {
            const { data: fileContent } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: item.path,
            });
            
            if ('content' in fileContent) {
              contractFiles.push({
                name: item.name,
                content: Buffer.from(fileContent.content, 'base64').toString(),
                path: item.path,
              });
            }
          } else if (item.type === 'dir') {
            const { data: dirContents } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: item.path,
            });
            await searchSolFiles(Array.isArray(dirContents) ? dirContents : [dirContents]);
          }
        }
      };

      await searchSolFiles(Array.isArray(contents) ? contents : [contents]);

      if (contractFiles.length === 0) {
        setError('No Solidity contracts found in this repository 😢');
        return;
      }

      setContracts(contractFiles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts from GitHub');
    } finally {
      setLoading(false);
    }
  };

  const generateRoast = async () => {
    if (contracts.length === 0) return;

    setLoading(true);
    try {
      const contractsText = contracts
        .map(c => `// File: ${c.path}\n${c.content}`)
        .join('\n\n');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a savage Solidity code reviewer who roasts smart contracts with brutal honesty but technical accuracy. Be funny, sarcastic, and merciless while pointing out real issues like gas inefficiencies, security vulnerabilities, poor patterns, etc. Use emojis and make it entertaining but educational.`,
          },
          {
            role: 'user',
            content: `Please roast these Solidity smart contracts:\n\n${contractsText}`,
          },
        ],
        max_tokens: 1500,
      });

      setRoast(response.choices[0].message.content || '');
    } catch (err: any) {
      setError('Failed to generate roast: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">🔥 Shafu Roast 🔥</CardTitle>
            <CardDescription>Your contracts suck and I will tell you why</CardDescription>
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
              🔥 Shafu Roast 🔥
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Submit your Solidity contracts for a ruthless code review
            </CardDescription>
            <div className="flex justify-center pt-2">
              <EchoTokenPurchase />
            </div>
          </CardHeader>
        </Card>

        {/* Input Section */}
        <Card className="border-orange-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">GitHub Repository</CardTitle>
            <CardDescription>
              Paste the GitHub URL of the repository containing Solidity contracts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={fetchContracts} 
                disabled={loading || !githubUrl}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Fetching...' : 'Fetch Contracts'}
              </Button>
            </div>

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Contracts Found */}
        {contracts.length > 0 && (
          <Card className="border-green-500/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Found Contracts ({contracts.length})
                <Button 
                  onClick={generateRoast}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Roasting...' : '🔥 ROAST THEM! 🔥'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contracts.map((contract, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-500/20 text-green-400">
                    {contract.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roast Results */}
        {roast && (
          <Card className="border-red-500/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-red-400">🔥 THE ROAST 🔥</CardTitle>
              <CardDescription>Prepare yourself for the truth...</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={roast}
                readOnly
                className="min-h-[400px] bg-black/60 text-white border-red-500/30 font-mono text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ContractRoaster />
    </EchoProvider>
  );
}

export default App;
