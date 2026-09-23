/**
 * Technical pronunciation dictionary and text cleaner for AI Voice Interviewer.
 * Translates programming syntax, symbols, acronyms, and abbreviations into
 * phonetically natural English phrases that speech synthesizers pronounce flawlessly.
 */

interface PronunciationRule {
  pattern: RegExp;
  replacement: string;
}

const PRONUNCIATION_RULES: PronunciationRule[] = [
  // Common conversational abbreviations (often mispronounced by TTS)
  { pattern: /\be\.g\.,?\s*/gi, replacement: 'for example, ' },
  { pattern: /\bi\.e\.,?\s*/gi, replacement: 'that is, ' },
  { pattern: /\betc\.,?\s*/gi, replacement: 'etcetera, ' },
  { pattern: /\bvs\.?\s*/gi, replacement: 'versus ' },
  { pattern: /\bw\/\s*/gi, replacement: 'with ' },
  { pattern: /\bw\/o\s*/gi, replacement: 'without ' },
  { pattern: /\band\/or\b/gi, replacement: 'and or' },

  // Programming operators and symbols (prevents literal reading of symbols)
  { pattern: /\s*===\s*/g, replacement: ' strict equals ' },
  { pattern: /\s*!==\s*/g, replacement: ' strict not equals ' },
  { pattern: /\s*==\s*/g, replacement: ' double equals ' },
  { pattern: /\s*!=\s*/g, replacement: ' not equals ' },
  { pattern: /\s*<=\s*/g, replacement: ' less than or equal to ' },
  { pattern: /\s*>=\s*/g, replacement: ' greater than or equal to ' },
  { pattern: /\s*->\s*/g, replacement: ' arrow ' },
  { pattern: /\s*::\s*/g, replacement: ' double colon ' },
  { pattern: /\s*&&\s*/g, replacement: ' and ' },
  { pattern: /\s*\|\|\s*/g, replacement: ' or ' },

  // Big-O notation
  { pattern: /\bO\(1\)/gi, replacement: 'O of 1' },
  { pattern: /\bO\(n\)/gi, replacement: 'O of N' },
  { pattern: /\bO\(log\s*n\)/gi, replacement: 'O of log N' },
  { pattern: /\bO\(n\s*log\s*n\)/gi, replacement: 'O of N log N' },
  { pattern: /\bO\(n\^2\)/gi, replacement: 'O of N squared' },

  // Parentheses after method names (e.g. "equals()" -> "equals method", "toString()" -> "toString method")
  { pattern: /\.equals\(\)/gi, replacement: ' dot equals method' },
  { pattern: /\.hashCode\(\)/gi, replacement: ' dot hashCode method' },
  { pattern: /\.toString\(\)/gi, replacement: ' dot toString method' },
  { pattern: /\.wait\(\)/gi, replacement: ' dot wait method' },
  { pattern: /\.notify\(\)/gi, replacement: ' dot notify method' },
  { pattern: /\.notifyAll\(\)/gi, replacement: ' dot notifyAll method' },
  { pattern: /([a-zA-Z0-9_]+)\(\)/g, replacement: '$1 method' },

  // Common frameworks & database technologies
  { pattern: /\bPostgreSQL\b/gi, replacement: 'Postgres Q L' },
  { pattern: /\bMySQL\b/gi, replacement: 'My S Q L' },
  { pattern: /\bNoSQL\b/gi, replacement: 'No S Q L' },
  { pattern: /\bSQL\b/g, replacement: 'S Q L' },
  { pattern: /\bGraphQL\b/gi, replacement: 'Graph Q L' },
  { pattern: /\bJSON\b/g, replacement: 'Jason' },
  { pattern: /\bYAML\b/gi, replacement: 'Yammel' },
  { pattern: /\bk8s\b/gi, replacement: 'Kubernetes' },
  { pattern: /\bCI\/CD\b/gi, replacement: 'C I C D' },
  { pattern: /\bI\/O\b/gi, replacement: 'Input Output' },
  { pattern: /\bUI\b/g, replacement: 'U I' },
  { pattern: /\bUX\b/g, replacement: 'U X' },
  { pattern: /\bAPI\b/g, replacement: 'A P I' },
  { pattern: /\bAPIs\b/g, replacement: 'A P Is' },
  { pattern: /\bJVM\b/g, replacement: 'J V M' },
  { pattern: /\bJDK\b/g, replacement: 'J D K' },
  { pattern: /\bJRE\b/g, replacement: 'J R E' },
  { pattern: /\bJPA\b/g, replacement: 'J P A' },
  { pattern: /\bAOP\b/g, replacement: 'A O P' },
  { pattern: /\bMVC\b/g, replacement: 'M V C' },
  { pattern: /\bRESTful\b/gi, replacement: 'Restful' },
  { pattern: /\bREST\b/g, replacement: 'Rest' },
  { pattern: /\bJWT\b/g, replacement: 'J W T' },
  { pattern: /\bOAuth\b/gi, replacement: 'O-Auth' },
  { pattern: /\bHTML\b/g, replacement: 'H T M L' },
  { pattern: /\bCSS\b/g, replacement: 'C S S' },
  { pattern: /\bDOM\b/g, replacement: 'Dom' },
  { pattern: /\bCPU\b/g, replacement: 'C P U' },
  { pattern: /\bRAM\b/g, replacement: 'Ram' },
  { pattern: /\bOS\b/g, replacement: 'O S' },
  { pattern: /\bPR\b/g, replacement: 'pull request' },
  { pattern: /\bPRs\b/g, replacement: 'pull requests' },

  // Annotations
  { pattern: /@Transactional\b/gi, replacement: 'at Transactional' },
  { pattern: /@Autowired\b/gi, replacement: 'at Autowired' },
  { pattern: /@Component\b/gi, replacement: 'at Component' },
  { pattern: /@Service\b/gi, replacement: 'at Service' },
  { pattern: /@Controller\b/gi, replacement: 'at Controller' },
  { pattern: /@RestController\b/gi, replacement: 'at Rest Controller' },
  { pattern: /@Bean\b/gi, replacement: 'at Bean' },
  { pattern: /@Override\b/gi, replacement: 'at Override' },

  // Slash phrases: e.g. "client/server" -> "client server"
  { pattern: /([a-zA-Z]+)\/([a-zA-Z]+)/g, replacement: '$1 $2' }
];

/**
 * Preprocesses raw technical text into natural, phonetically tuned speech text.
 */
export function formatTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let speechText = rawText
    // Remove score headers and feedback labels
    .replace(/^Score:\s*\d+\s*(?:\/\s*10)?/gim, '')
    .replace(/^Feedback:\s*/gim, '')
    .replace(/Next Question:[\s\S]*$/gi, '')
    // Remove markdown code blocks and inline code ticks
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown formatting
    .replace(/[*#_~]/g, ' ');

  // Apply pronunciation rules
  for (const rule of PRONUNCIATION_RULES) {
    speechText = speechText.replace(rule.pattern, rule.replacement);
  }

  // Normalize whitespace and spacing around punctuation for natural breathing
  return speechText
    .replace(/([.?!])\s*/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
}
