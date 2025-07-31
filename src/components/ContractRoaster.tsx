import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useEcho, useEchoOpenAI, EchoSignIn } from '@zdql/echo-react-sdk';
import html2canvas from 'html2canvas';

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
    label: '🥺 Gentle',
    prompt: 'Be constructive and kind',
  },
  {
    id: 'medium',
    label: '😤 Medium',
    prompt: 'Be funny but helpful',
  },
  {
    id: 'spicy',
    label: '🔥 Well Done',
    prompt: 'Be savage and hilarious',
  },
  {
    id: 'nuclear',
    label: '💀 Nuclear',
    prompt: 'Show no mercy, maximum savagery',
  },
  {
    id: 'shafu',
    label: '🌋 shafu',
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

  const loadExampleUrl = (url: string) => {
    setGithubUrl(url);
    setError('');
  };

  // 📸 Image capture and sharing functions
  const captureCardAsImage = async (): Promise<Blob | null> => {
    const cardElement = document.getElementById('roast-card');
    if (!cardElement) {
      alert('❌ Card not found! Please try again.');
      return null;
    }

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#000000',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
      });

      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Failed to capture card:', error);
      alert('❌ Failed to capture card. Please try again.');
      return null;
    }
  };

  const downloadCardImage = async () => {
    const blob = await captureCardAsImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contractName}-roast-by-shafu.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('📸 Roast card downloaded! Perfect for sharing on social media.');
  };

  const copyCardImage = async () => {
    const blob = await captureCardAsImage();
    if (!blob) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      alert('📋 Roast card copied to clipboard! Paste it anywhere.');
    } catch (error) {
      console.error('Failed to copy image:', error);
      // Fallback to download if clipboard doesn't support images
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contractName}-roast-by-shafu.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('📸 Clipboard not supported. Downloaded image instead!');
    }
  };

  const shareCardImage = async () => {
    const blob = await captureCardAsImage();
    if (!blob) return;

    const file = new File([blob], `${contractName}-roast-by-shafu.png`, {
      type: 'image/png',
    });

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          title: `${contractName} Roasted by shafu`,
          text: `Check out this savage roast of ${contractName}! 🔥`,
          files: [file],
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Failed to share:', error);
          // Fallback to download
          downloadCardImage();
        }
      }
    } else {
      // Fallback to download if native sharing isn't supported
      downloadCardImage();
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg border-orange-500/20 bg-black/40 backdrop-blur">
          <CardHeader className="text-center px-4 py-6 sm:px-6 sm:py-8">
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400">
              shafu Roast
            </CardTitle>
            <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-200 mt-2">
              Your contracts suck and I will tell you why
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center px-4 pb-6 sm:px-6 sm:pb-8 lg:pb-10">
            <EchoSignIn />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card
          className={`border-orange-500/20 bg-black/40 backdrop-blur ${ultraSavageMode ? 'animate-pulse border-red-600' : ''}`}
        >
          <CardHeader className="text-center relative px-4 py-6 sm:px-6 sm:py-8">
            {/* shafu Avatar - responsive positioning */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <img
                src="/shafu.jpg"
                alt="shafu"
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-orange-400 pixelated transition-all duration-300 ${
                  shafuJudging ? 'animate-bounce scale-110 border-red-500' : ''
                } ${ultraSavageMode ? 'animate-spin border-red-600' : ''}`}
                style={{ imageRendering: 'pixelated' }}
              />
              {shafuJudging && (
                <div className="absolute -top-6 -left-3 sm:-top-8 sm:-left-4 bg-black/80 text-orange-400 text-xs px-2 py-1 rounded animate-pulse">
                  Judging...
                </div>
              )}
            </div>

            {/* Title - responsive text size */}
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 pr-16 sm:pr-20">
              🔥 shafu Roast 🔥 {ultraSavageMode && '💀'}
            </CardTitle>

            {/* Description - responsive and better mobile layout */}
            <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-200 mt-2 px-2 sm:px-0">
              <div className="mb-2">
                Submit your Solidity contracts for a ruthless code review
              </div>
              {ultraSavageMode && (
                <div className="text-red-400 font-bold text-xs sm:text-sm lg:text-base animate-bounce bg-red-500/10 rounded-lg px-3 py-2 mx-auto max-w-xs sm:max-w-none">
                  🌋 ULTRA SAVAGE MODE 🌋
                  <div className="text-xs mt-1 text-red-300">
                    Maximum destruction enabled
                  </div>
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Roast Severity Selector */}
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle className="text-cyan-400 text-lg sm:text-xl lg:text-2xl">
              🎯 Destruction Level
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-200 mt-1">
              Choose your preferred level of digital violence
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              {ROAST_SEVERITIES.map(severity => (
                <Button
                  key={severity.id}
                  variant={
                    roastSeverity.id === severity.id ? 'default' : 'outline'
                  }
                  onClick={() => setRoastSeverity(severity)}
                  className={`text-xs sm:text-sm p-3 sm:p-2 h-auto min-h-[44px] sm:min-h-auto ${
                    roastSeverity.id === severity.id
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'border-gray-600 hover:border-red-500'
                  } ${severity.id === 'shafu' ? 'border-orange-500 text-orange-400' : ''}`}
                  disabled={severity.id === 'shafu' && !ultraSavageMode}
                >
                  <span className="text-center leading-tight">
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
                  </span>
                </Button>
              ))}
            </div>
            {roastSeverity.id === 'shafu' && (
              <div className="text-orange-400 text-xs sm:text-sm mt-3 text-center bg-orange-500/10 rounded-lg px-3 py-2">
                🌋 Maximum destruction mode - No contract survives this
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="border-orange-500/20 bg-black/40 backdrop-blur">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle className="text-cyan-400 text-lg sm:text-xl lg:text-2xl">
              🎯 Target Acquisition
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-200 mt-1">
              Drop a GitHub link and watch your contract get absolutely
              demolished
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Input
                placeholder="https://github.com/user/repo/blob/main/contracts/Contract.sol"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="flex-1 placeholder:text-gray-500 text-sm sm:text-base h-11 sm:h-10"
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
                className="bg-orange-600 hover:bg-orange-700 min-w-[140px] sm:min-w-[140px] h-11 sm:h-10 text-sm sm:text-base whitespace-nowrap"
              >
                {fetchingContract ? '🎯 Locking...' : '🔫 Lock & Load'}
              </Button>
            </div>

            {/* Example Contracts */}
            <div className="border-t border-gray-700 pt-4">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">
                Try an example:
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    loadExampleUrl(
                      'https://github.com/Merit-Systems/contracts/blob/master/src/Escrow.sol'
                    )
                  }
                  className="border-orange-500/20 text-orange-400 text-xs transition-colors"
                >
                  🔥 Merit Escrow
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    loadExampleUrl(
                      'https://github.com/Vectorized/solady/blob/main/src/tokens/ERC20.sol'
                    )
                  }
                  className="border-blue-500/20 text-blue-400 text-xs transition-colors"
                >
                  ⚡ Solady ERC20
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    loadExampleUrl(
                      'https://github.com/sablier-labs/lockup/blob/main/src/SablierLockup.sol'
                    )
                  }
                  className="border-purple-500/20 text-purple-400 text-xs transition-colors"
                >
                  🌊 Sablier v2
                </Button>
              </div>
            </div>

            {/* Loading Messages */}
            {fetchingContract && currentLoadingMessage && (
              <div className="text-center px-2">
                <div className="text-yellow-400 animate-pulse text-sm sm:text-base">
                  {currentLoadingMessage}
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10 animate-shake">
                <AlertDescription className="text-red-400 font-bold text-sm sm:text-base">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Contract Found */}
        {contractContent && (
          <Card className="border-green-500/20 bg-black/40 backdrop-blur animate-fadeIn">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-cyan-400 text-lg sm:text-xl lg:text-2xl">
                {/* Mobile: Stack vertically, Desktop: Side by side */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
                  {/* Contract Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400 text-xs sm:text-sm whitespace-nowrap"
                    >
                      🎯 {contractName}
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-400">
                      ({contractContent.split('\n').length} LOC)
                    </span>
                  </div>

                  {/* Roast Button */}
                  <Button
                    onClick={generateRoast}
                    disabled={roasting}
                    className={`w-full sm:w-auto min-w-0 sm:min-w-[180px] lg:min-w-[200px] h-11 sm:h-10 text-sm sm:text-base ${
                      roastSeverity.id === 'shafu'
                        ? 'bg-orange-600 hover:bg-orange-700 animate-pulse'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {roasting ? (
                      <span className="animate-bounce text-xs sm:text-sm">
                        💀{' '}
                        {roastSeverity.id === 'shafu'
                          ? 'OBLITERATING'
                          : 'DESTROYING'}{' '}
                        💀
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm">
                        {roastSeverity.id === 'gentle' && '🥺 Please Review'}
                        {roastSeverity.id === 'medium' && '😤 Roast This'}
                        {roastSeverity.id === 'spicy' && '🔥 DESTROY IT'}
                        {roastSeverity.id === 'nuclear' && '💀 ANNIHILATE'}
                        {roastSeverity.id === 'shafu' && '🌋 OBLITERATE'}
                      </span>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <Textarea
                value={contractContent}
                readOnly
                className="min-h-[150px] sm:min-h-[200px] max-h-[250px] sm:max-h-[300px] bg-black/60 text-white border-green-500/30 font-mono text-xs sm:text-sm"
              />
            </CardContent>
          </Card>
        )}

        {/* Roasting Loading Messages */}
        {roasting && currentRoastingMessage && (
          <Card className="border-yellow-500/20 bg-yellow-500/5 backdrop-blur animate-pulse">
            <CardContent className="text-center py-4 px-4 sm:py-6 sm:px-6 relative">
              {/* Judging shafu */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-2">
                <a
                  href="https://x.com/shafu0x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:block"
                >
                  <img
                    src="/shafu.jpg"
                    alt="shafu judging"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-yellow-400 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </a>
                <div className="text-yellow-400 font-bold text-sm sm:text-base lg:text-lg text-center px-2">
                  {currentRoastingMessage}
                </div>
                <a
                  href="https://x.com/shafu0x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:block"
                >
                  <img
                    src="/shafu.jpg"
                    alt="shafu judging"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-yellow-400 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
                    style={{
                      imageRendering: 'pixelated',
                      animationDelay: '0.5s',
                    }}
                  />
                </a>
              </div>

              {/* Mobile: Single centered avatar */}
              <div className="flex justify-center mb-3 sm:hidden">
                <a
                  href="https://x.com/shafu0x"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/shafu.jpg"
                    alt="shafu judging"
                    className="w-16 h-16 rounded-full border-2 border-yellow-400 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </a>
              </div>

              <div className="text-yellow-300 text-xs sm:text-sm px-2">
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

        {/* Roast Results - Twitter Card Design */}
        {(roast || roasting) && (
          <Card className="border-red-500/20 bg-black/40 backdrop-blur animate-slideUp">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-red-400 flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                THE ROAST CARD
                {ultraSavageMode && <span className="animate-spin">💀</span>}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                {roasting
                  ? 'Generating shareable roast card...'
                  : 'Perfect for ending friendships on Twitter'}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              {/* Twitter-style Roast Card */}
              <div
                id="roast-card"
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-500/30 p-6 sm:p-8 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-8 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="border border-red-500/20" />
                    ))}
                  </div>
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Card Header with Repo Info */}
                  <div className="flex items-center gap-4 mb-6 pb-2">
                    {/* GitHub Repo Logo/Avatar */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                      {contractName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base sm:text-lg break-words leading-tight mb-1">
                        {contractName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <span>{contractContent.split('\n').length} lines</span>
                      </div>
                    </div>

                    {/* shafu Rating */}
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-orange-400 overflow-hidden mb-1 shadow-lg">
                        <img
                          src="/shafu.jpg"
                          alt="shafu"
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="text-xs text-orange-400 font-bold">
                        {memeRating}/10
                      </div>
                    </div>
                  </div>

                  {/* Roast Content */}
                  <div className="bg-black/80 p-4 sm:p-6 border border-red-500/20 mb-6 shadow-inner">
                    {roasting ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-yellow-400 animate-pulse text-center">
                          <div className="text-lg sm:text-xl mb-2">🔥</div>
                          <div>Crafting the perfect roast...</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-white leading-relaxed text-sm sm:text-base">
                        {roast}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <img
                        src="/shafu.jpg"
                        alt="shafu"
                        className="w-5 h-5 rounded-full border border-orange-400"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span>
                        Roasted by{' '}
                        <span className="text-orange-400">shafu</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🔥</span>
                      <span className="text-orange-400">
                        shafu-roast.vercel.app
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!roasting && roast && (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={copyCardImage}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      📋 Copy Image
                    </Button>

                    <Button
                      onClick={downloadCardImage}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      📸 Download PNG
                    </Button>

                    <Button
                      onClick={shareCardImage}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      📤 Share Image
                    </Button>

                    <Button
                      onClick={() => {
                        const text = `🔥 Just got my ${contractName} contract roasted by @shafu0x! 💀\n\nGet your contracts destroyed: https://shafu-roast.vercel.app/`;
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                          '_blank'
                        );
                      }}
                      className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8]"
                    >
                      🐦 Tweet
                    </Button>
                  </div>
                </>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="text-green-400 animate-bounce text-center text-sm mt-4">
                  🏆 Achievement Unlocked: Twitter Roast Master
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden Instructions */}
        {!roasting && !roast && (
          <Card className="border-gray-500/20 bg-black/20 backdrop-blur">
            <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
              <div className="text-gray-400 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
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
                      className="w-8 h-8 sm:w-6 sm:h-6 rounded-full border border-gray-400 hover:border-orange-400 transition-all duration-300 hover:scale-125 cursor-pointer"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </a>
                  <div className="text-sm sm:text-base text-center">
                    🎮 Pro tip: Try the Konami code for maximum destruction
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-mono tracking-wider">
                  ↑ ↑ ↓ ↓ ← → ← → B A
                </div>
                <div className="text-xs sm:text-sm mt-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
