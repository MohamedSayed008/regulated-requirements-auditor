import { Box, Text } from '@chakra-ui/react';

/**
 * Lightweight syntax highlighting for finding code excerpts, using the same
 * semantic tokens as the hand-built sample on the home page: keywords in
 * code.kw, numbers in code.num, strings gold, comments faded. Regex-based and
 * TS/JS-oriented; anything unmatched renders in the default ink, so unknown
 * languages degrade to plain text. No dependencies, renders on the server.
 */

const TOKEN_PATTERN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(export|import|from|const|let|var|function|return|if|else|new|type|interface|extends|implements|class|async|await|throw|try|catch|switch|case|default|for|while|of|in|typeof|instanceof|null|undefined|true|false|this|readonly|public|private|enum)\b|\b(\d+(?:\.\d+)?)\b/g;

type TokenKind = 'comment' | 'string' | 'keyword' | 'number' | 'plain';

const TOKEN_COLOR: Record<Exclude<TokenKind, 'plain'>, string> = {
  comment: 'fg.subtle',
  string: 'law.fg',
  keyword: 'code.kw',
  number: 'code.num',
};

interface Token {
  kind: TokenKind;
  text: string;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ kind: 'plain', text: code.slice(last, index) });
    const [, comment, string, keyword, number] = match;
    const kind: TokenKind = comment
      ? 'comment'
      : string
        ? 'string'
        : keyword
          ? 'keyword'
          : number
            ? 'number'
            : 'plain';
    tokens.push({ kind, text: match[0] });
    last = index + match[0].length;
  }
  if (last < code.length) tokens.push({ kind: 'plain', text: code.slice(last) });
  return tokens;
}

export function CodeExcerpt({ code }: { code: string }) {
  return (
    <Box
      as="pre"
      dir="ltr"
      bg="bg.canvas"
      borderWidth="1px"
      borderColor="border.default"
      rounded="lg"
      p="3"
      fontFamily="heading"
      fontSize="xs"
      lineHeight="1.7"
      color="fg.default"
      overflowX="auto"
      whiteSpace="pre"
    >
      {tokenize(code).map((token, i) =>
        token.kind === 'plain' ? (
          token.text
        ) : (
          <Text as="span" key={i} color={TOKEN_COLOR[token.kind]}>
            {token.text}
          </Text>
        )
      )}
    </Box>
  );
}
