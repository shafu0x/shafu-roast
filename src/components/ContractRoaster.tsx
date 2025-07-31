import { useState, useRef, useEffect } from 'react';
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

// 🎭 COMEDY CONSTANTS
const LOADING_MESSAGES = [
  '🔍 Scanning for obvious bugs...',
  '💸 Calculating potential rug pull probability...',
  "🧠 Teaching AI what 'good code' looks like...",
  '⚡ Charging up the roast cannon...',
  '🔥 Preheating the burn chamber...',
  '🤖 Consulting the smart contract gods...',
  '💀 Preparing digital funeral for this code...',
  '🚨 Alert: Cringe levels dangerously high...',
  '🎯 Loading maximum destruction mode...',
  '🧨 Arming the code criticism missiles...',
];

const ROASTING_MESSAGES = [
  '🔥 Roasting at maximum heat...',
  '💀 Currently murdering this contract...',
  '🤖 AI is physically cringing...',
  '⚰️ Preparing eulogy for this code...',
  '🌋 Absolutely obliterating...',
  '🎪 This is a whole circus...',
  '💣 Dropping nuclear-level burns...',
  '🚨 Code quality emergency detected...',
];

const ROAST_SEVERITIES = [
  {
    id: 'gentle',
    label: '🥺 Gentle Feedback',
    prompt: 'Be constructive and kind',
  },
  {
    id: 'medium',
    label: '😤 Medium Rare Roast',
    prompt: 'Be funny but helpful',
  },
  {
    id: 'spicy',
    label: '🔥 Well Done Destruction',
    prompt: 'Be savage and hilarious',
  },
  {
    id: 'nuclear',
    label: '💀 Absolutely Nuclear',
    prompt: 'Show no mercy, maximum savagery',
  },
  {
    id: 'shafu',
    label: '🌋 shafu Mode',
    prompt: 'Channel the spirit of shafu - ultimate destruction',
  },
];

const SAVAGE_ERRORS = {
  invalidUrl: "🤡 Bruh, that's not even a real GitHub URL. Try again.",
  noContract: "😵 This contract is so broken, even GitHub won't show it",
  notFound: "🚫 404: Contract's dignity not found",
  timeout: '⏰ Your contract took so long to load, I aged 10 years',
  network: "🌐 Network error: Even the internet doesn't want to fetch this",
  generic: "💥 Something went wrong. Probably your code's fault.",
};

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
  const [roastSeverity, setRoastSeverity] = useState(ROAST_SEVERITIES[2]); // Default to "Well Done"
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  const [currentRoastingMessage, setCurrentRoastingMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [konamiCode, setKonamiCode] = useState('');
  const [ultraSavageMode, setUltraSavageMode] = useState(false);
  const [memeRating, setMemeRating] = useState<number>(0);
  const [shafuJudging, setShafuJudging] = useState(false);
  const roastContainerRef = useRef<HTMLDivElement>(null);

  // 🎲 Generate random meme rating when contract is loaded
  const generateMemeRating = () => {
    return Math.floor(Math.random() * 10) + 1; // 1-10 shafu coins
  };

  const getMemeComment = (rating: number) => {
    if (rating <= 2) return 'Code broken. shafu disappointed. 😭';
    if (rating <= 4) return 'Amateur work. shafu concerned. 😬';
    if (rating <= 6) return 'Issues detected. More security needed. 🤔';
    if (rating <= 8) return 'Decent effort. shafu approves. 👍';
    return 'Professional grade. shafu impressed. Solid work! 🚀';
  };

  // 🎮 Konami Code: Up Up Down Down Left Right Left Right B A
  const KONAMI_SEQUENCE =
    'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightKeyBKeyA';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newCode = konamiCode + event.code;

      if (KONAMI_SEQUENCE.startsWith(newCode)) {
        setKonamiCode(newCode);

        if (newCode === KONAMI_SEQUENCE) {
          setUltraSavageMode(true);
          setRoastSeverity(ROAST_SEVERITIES[4]); // Set to shafu mode
          alert(
            '🌋 ULTRA SAVAGE MODE ACTIVATED! 💀\nNo contract will survive this level of destruction!'
          );
          setKonamiCode('');
        }
      } else {
        setKonamiCode('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode]);

  // 🎭 Rotating loading messages
  const getRandomLoadingMessage = () => {
    return LOADING_MESSAGES[
      Math.floor(Math.random() * LOADING_MESSAGES.length)
    ];
  };

  const getSavageError = (error: string) => {
    if (error.includes('404') || error.includes('not found'))
      return SAVAGE_ERRORS.notFound;
    if (error.includes('network') || error.includes('fetch'))
      return SAVAGE_ERRORS.network;
    if (error.includes('timeout')) return SAVAGE_ERRORS.timeout;
    if (error.includes('invalid') || error.includes('url'))
      return SAVAGE_ERRORS.invalidUrl;
    return SAVAGE_ERRORS.generic;
  };

  const fetchContract = async () => {
    setFetchingContract(true);
    setError('');
    setContractContent('');
    setContractName('');
    setRoast('');
    setShowSuccess(false);

    // 🎯 Start with random loading message and rotate every 2 seconds
    const startMessage = getRandomLoadingMessage();
    setCurrentLoadingMessage(startMessage);

    const messageInterval = setInterval(() => {
      setCurrentLoadingMessage(getRandomLoadingMessage());
    }, 2000);

    try {
      const result = await fetchContractFromGithub(githubUrl);

      if (result.error) {
        setError(getSavageError(result.error));
        return;
      }

      setContractContent(result.content);
      setContractName(result.name);

      // 🎲 Generate meme rating
      const rating = generateMemeRating();
      setMemeRating(rating);

      // 🎉 Success message
      setCurrentLoadingMessage(
        '🎯 Contract locked and loaded! Ready for destruction!'
      );
    } catch (err: any) {
      const savageError = getSavageError(err.message);
      setError(savageError);
    } finally {
      clearInterval(messageInterval);
      setFetchingContract(false);
      setCurrentLoadingMessage('');
    }
  };

  const getRandomRoastingMessage = () => {
    return ROASTING_MESSAGES[
      Math.floor(Math.random() * ROASTING_MESSAGES.length)
    ];
  };

  const generateRoast = async () => {
    if (!contractContent) return;

    setRoasting(true);
    setRoast(''); // Clear previous roast
    setError('');
    setShowSuccess(false);

    // 🔥 Start rotating roasting messages
    const startMessage = getRandomRoastingMessage();
    setCurrentRoastingMessage(startMessage);

    // 👨‍💻 shafu starts judging
    setShafuJudging(true);

    const messageInterval = setInterval(() => {
      setCurrentRoastingMessage(getRandomRoastingMessage());
    }, 1500);

    try {
      // 💀 Enhanced prompt with severity level
      const enhancedPrompt = `${ROASTER_SYSTEM_PROMPT}

ROAST SEVERITY: ${roastSeverity.prompt}
${ultraSavageMode ? '⚠️ ULTRA SAVAGE MODE ACTIVATED - SHOW ABSOLUTELY NO MERCY!' : ''}

${createRoastPrompt(contractName, contractContent)}`;

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        max_tokens: ultraSavageMode ? 2000 : 1500,
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

      // 🎉 Success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      setError(getSavageError('Failed to generate roast: ' + err.message));
    } finally {
      clearInterval(messageInterval);
      setRoasting(false);
      setCurrentRoastingMessage('');
      setShafuJudging(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              🔥{' '}
              <a
                href="https://x.com/shafu0x"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline cursor-pointer transition-all duration-300 hover:scale-105 inline-block text-orange-400"
              >
                shafu
              </a>{' '}
              Roast 🔥
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
        <Card
          className={`border-orange-500/20 bg-black/40 backdrop-blur ${ultraSavageMode ? 'animate-pulse border-red-600' : ''}`}
        >
          <CardHeader className="text-center relative">
            {/* shafu Avatar */}
            <div className="absolute top-4 right-4">
              <a
                href="https://x.com/shafu0x"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:scale-110 transition-transform duration-300"
              >
                <img
                  src="/shafu.jpg"
                  alt="shafu"
                  className={`w-16 h-16 rounded-full border-2 border-orange-400 pixelated transition-all duration-300 cursor-pointer ${
                    shafuJudging
                      ? 'animate-bounce scale-110 border-red-500'
                      : ''
                  } ${ultraSavageMode ? 'animate-spin border-red-600' : ''}`}
                  style={{ imageRendering: 'pixelated' }}
                />
              </a>
              {shafuJudging && (
                <div className="absolute -top-8 -left-4 bg-black/80 text-orange-400 text-xs px-2 py-1 rounded animate-pulse">
                  Judging...
                </div>
              )}
            </div>

            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              🔥{' '}
              <a
                href="https://x.com/shafu0x"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline cursor-pointer transition-all duration-300 hover:scale-105 inline-block"
              >
                shafu
              </a>{' '}
              Roast 🔥 {ultraSavageMode && '💀'}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Submit your Solidity contracts for a ruthless code review
              {ultraSavageMode && (
                <div className="text-red-400 font-bold mt-2 animate-bounce">
                  🌋 ULTRA SAVAGE MODE ACTIVATED 🌋
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Roast Severity Selector */}
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">🎯 Destruction Level</CardTitle>
            <CardDescription>
              Choose your preferred level of digital violence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              {ROAST_SEVERITIES.map(severity => (
                <Button
                  key={severity.id}
                  variant={
                    roastSeverity.id === severity.id ? 'default' : 'outline'
                  }
                  onClick={() => setRoastSeverity(severity)}
                  className={`text-xs p-2 h-auto ${
                    roastSeverity.id === severity.id
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'border-gray-600 hover:border-red-500'
                  } ${severity.id === 'shafu' ? 'border-orange-500 text-orange-400' : ''}`}
                  disabled={severity.id === 'shafu' && !ultraSavageMode}
                >
                  {severity.id === 'shafu' ? (
                    <>
                      🌋{' '}
                      <a
                        href="https://x.com/shafu0x"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      >
                        shafu
                      </a>{' '}
                      Mode
                    </>
                  ) : (
                    severity.label
                  )}
                </Button>
              ))}
            </div>
            {roastSeverity.id === 'shafu' && (
              <div className="text-orange-400 text-sm mt-2 text-center">
                🌋 Maximum destruction mode - No contract survives this
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="border-orange-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">🎯 Target Acquisition</CardTitle>
            <CardDescription>
              Drop a GitHub link and watch your contract get absolutely
              demolished
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/user/repo/blob/main/contracts/YourDoomedContract.sol"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="flex-1"
                onKeyPress={e =>
                  e.key === 'Enter' &&
                  !fetchingContract &&
                  githubUrl &&
                  fetchContract()
                }
              />
              <Button
                onClick={fetchContract}
                disabled={fetchingContract || !githubUrl}
                className="bg-orange-600 hover:bg-orange-700 min-w-[140px]"
              >
                {fetchingContract ? '🎯 Locking Target...' : '🔫 Lock and Load'}
              </Button>
            </div>

            {/* Loading Messages */}
            {fetchingContract && currentLoadingMessage && (
              <div className="text-center">
                <div className="text-yellow-400 animate-pulse">
                  {currentLoadingMessage}
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10 animate-shake">
                <AlertDescription className="text-red-400 font-bold">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Contract Found */}
        {contractContent && (
          <Card className="border-green-500/20 bg-black/40 backdrop-blur animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-400"
                  >
                    🎯 {contractName}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    ({contractContent.split('\n').length} lines of potential
                    chaos)
                  </span>
                  {/* Meme Rating */}
                  {memeRating > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-orange-400">
                        {'🔥'.repeat(memeRating)}
                      </span>
                      <span className="text-gray-500">({memeRating}/10)</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={generateRoast}
                  disabled={roasting}
                  className={`min-w-[200px] ${
                    roastSeverity.id === 'shafu'
                      ? 'bg-orange-600 hover:bg-orange-700 animate-pulse'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {roasting ? (
                    <span className="animate-bounce">
                      💀{' '}
                      {roastSeverity.id === 'shafu'
                        ? 'OBLITERATING'
                        : 'DESTROYING'}{' '}
                      💀
                    </span>
                  ) : (
                    <>
                      {roastSeverity.id === 'gentle' && '🥺 Please Review'}
                      {roastSeverity.id === 'medium' && '😤 Roast This'}
                      {roastSeverity.id === 'spicy' && '🔥 DESTROY IT'}
                      {roastSeverity.id === 'nuclear' && '💀 ANNIHILATE'}
                      {roastSeverity.id === 'shafu' && '🌋 OBLITERATE'}
                    </>
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

        {/* Roasting Loading Messages */}
        {roasting && currentRoastingMessage && (
          <Card className="border-yellow-500/20 bg-yellow-500/5 backdrop-blur animate-pulse">
            <CardContent className="text-center py-4 relative">
              {/* Judging shafu */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <a
                  href="https://x.com/shafu0x"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/shafu.jpg"
                    alt="shafu judging"
                    className="w-12 h-12 rounded-full border-2 border-yellow-400 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </a>
                <div className="text-yellow-400 font-bold text-lg">
                  {currentRoastingMessage}
                </div>
                <a
                  href="https://x.com/shafu0x"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/shafu.jpg"
                    alt="shafu judging"
                    className="w-12 h-12 rounded-full border-2 border-yellow-400 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
                    style={{
                      imageRendering: 'pixelated',
                      animationDelay: '0.5s',
                    }}
                  />
                </a>
              </div>
              <div className="text-yellow-300 text-sm">
                <a
                  href="https://x.com/shafu0x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer text-orange-400"
                >
                  shafu
                </a>{' '}
                is personally reviewing your code... This won't end well.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roast Results */}
        {(roast || roasting) && (
          <Card className="border-red-500/20 bg-black/40 backdrop-blur animate-slideUp">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    🔥 THE ROAST 🔥
                    {ultraSavageMode && (
                      <span className="animate-spin">💀</span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {roasting
                      ? 'Streaming roast in real-time...'
                      : showSuccess
                        ? '🎉 Another contract has been successfully roasted!'
                        : "RIP to this developer's confidence..."}
                  </CardDescription>
                </div>

                {/* Success & Sharing */}
                {!roasting && roast && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(roast);
                        alert(
                          '💀 Roast copied! Perfect for ending friendships'
                        );
                      }}
                      className="border-gray-600 hover:border-red-500"
                    >
                      📋 Copy Roast
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = `Just got my Solidity contract absolutely demolished by @shafu0x's roast tool! 🔥💀\n\nCheck it out: https://shafu-roast.vercel.app/`;
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                          '_blank'
                        );
                      }}
                      className="border-gray-600 hover:border-blue-500"
                    >
                      🐦 Tweet Burn
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div
                ref={roastContainerRef}
                className={`min-h-[400px] max-h-[600px] overflow-y-auto bg-black/60 text-white border border-red-500/30 rounded-md p-4 font-mono text-sm leading-relaxed scroll-smooth ${
                  roasting ? 'animate-pulse' : ''
                }`}
              >
                <pre className="whitespace-pre-wrap">
                  {roast}
                  {roasting && (
                    <span className="inline-block w-2 h-4 bg-red-500 animate-pulse ml-1" />
                  )}
                </pre>
              </div>

              {/* Roast Quality Assessment */}
              {!roasting && roast && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      📊 Roast Quality: {roastSeverity.label} • Character Count:{' '}
                      {roast.length} • Brutality Level:{' '}
                      {roastSeverity.id === 'shafu' ? 'MAXIMUM' : 'HIGH'}
                    </div>
                  </div>
                  {/* Meme Rating Assessment */}
                  {memeRating > 0 && (
                    <div className="text-sm text-center p-3 bg-orange-500/10 rounded border border-orange-500/20">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <a
                          href="https://x.com/shafu0x"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="/shafu.jpg"
                            alt="shafu rating"
                            className={`w-8 h-8 rounded-full border border-orange-400 cursor-pointer hover:scale-110 transition-transform duration-300 ${
                              memeRating >= 8
                                ? 'animate-bounce'
                                : memeRating <= 3
                                  ? 'grayscale animate-pulse'
                                  : ''
                            }`}
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </a>
                        <div className="text-orange-400 font-bold">
                          🔥{' '}
                          <a
                            href="https://x.com/shafu0x"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline cursor-pointer"
                          >
                            shafu
                          </a>{' '}
                          Rating: {'🔥'.repeat(memeRating)} ({memeRating}/10)
                        </div>
                        <a
                          href="https://x.com/shafu0x"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="/shafu.jpg"
                            alt="shafu rating"
                            className={`w-8 h-8 rounded-full border border-orange-400 cursor-pointer hover:scale-110 transition-transform duration-300 ${
                              memeRating >= 8
                                ? 'animate-bounce'
                                : memeRating <= 3
                                  ? 'grayscale animate-pulse'
                                  : ''
                            }`}
                            style={{
                              imageRendering: 'pixelated',
                              animationDelay: '0.2s',
                            }}
                          />
                        </a>
                      </div>
                      <div className="text-yellow-300 text-xs">
                        {getMemeComment(memeRating)}
                      </div>
                    </div>
                  )}
                  {showSuccess && (
                    <div className="text-green-400 animate-bounce">
                      🏆 Achievement Unlocked: Code Destroyer
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden Instructions */}
        {!roasting && !roast && (
          <Card className="border-gray-500/20 bg-black/20 backdrop-blur">
            <CardContent className="text-center py-8">
              <div className="text-gray-400 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <a
                    href="https://x.com/shafu0x"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => {
                      // Random shafu easter egg on right click or ctrl+click
                      if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const messages = [
                          '👋 Hello! I see you found me...',
                          '🔥 Ready to roast some contracts?',
                          '💀 Your code probably sucks',
                          "🚀 Let's build secure contracts!",
                          '😎 Nice pixel art, right?',
                        ];
                        alert(
                          messages[Math.floor(Math.random() * messages.length)]
                        );
                      }
                    }}
                  >
                    <img
                      src="/shafu.jpg"
                      alt="shafu"
                      className="w-6 h-6 rounded-full border border-gray-400 hover:border-orange-400 transition-all duration-300 hover:scale-125 cursor-pointer"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </a>
                  <div>
                    🎮 Pro tip: Try the Konami code for maximum destruction
                  </div>
                </div>
                <div className="text-xs">↑ ↑ ↓ ↓ ← → ← → B A</div>
                <div className="text-xs mt-4 flex items-center justify-center gap-2">
                  <span>Built with 💀 by</span>
                  <a
                    href="https://x.com/shafu0x"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src="/shafu.jpg"
                      alt="shafu"
                      className="w-4 h-4 rounded-full border border-orange-400 animate-pulse cursor-pointer"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className="hover:underline cursor-pointer text-orange-400">
                      shafu
                    </span>
                  </a>
                  <span>for the Solidity community</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
