// URL 감지를 위한 정규식 패턴
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const SIMPLE_URL_REGEX = /(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export interface URLMatch {
  url: string;
  start: number;
  end: number;
  displayUrl: string;
}

/**
 * 텍스트에서 URL을 감지하고 위치 정보를 반환합니다.
 * @param text 분석할 텍스트
 * @returns URL 매치 정보 배열
 */
export function detectURLs(text: string): URLMatch[] {
  const matches: URLMatch[] = [];
  
  // http/https 프로토콜이 있는 URL 감지
  let match: RegExpExecArray | null;
  const fullUrlRegex = new RegExp(URL_REGEX);
  while ((match = fullUrlRegex.exec(text)) !== null) {
    matches.push({
      url: match[0],
      start: match.index,
      end: match.index + match[0].length,
      displayUrl: match[0]
    });
  }
  
  // www로 시작하는 URL 감지 (프로토콜 없음)
  const simpleUrlRegex = new RegExp(SIMPLE_URL_REGEX);
  while ((match = simpleUrlRegex.exec(text)) !== null) {
    // 이미 감지된 URL과 겹치는지 확인
    const isOverlapping = matches.some(
      existing => match!.index >= existing.start && match!.index < existing.end
    );
    
    if (!isOverlapping && match[0].startsWith('www.')) {
      matches.push({
        url: `https://${match[0]}`,
        start: match.index,
        end: match.index + match[0].length,
        displayUrl: match[0]
      });
    }
  }
  
  // 시작 위치순으로 정렬
  return matches.sort((a, b) => a.start - b.start);
}

/**
 * 텍스트를 URL과 일반 텍스트 세그먼트로 분리합니다.
 * @param text 분석할 텍스트
 * @returns 세그먼트 배열
 */
export interface TextSegment {
  type: 'text' | 'url';
  content: string;
  url?: string;
}

export function parseTextWithURLs(text: string): TextSegment[] {
  const urls = detectURLs(text);
  const segments: TextSegment[] = [];
  
  let lastIndex = 0;
  
  urls.forEach(urlMatch => {
    // URL 이전의 일반 텍스트 추가
    if (urlMatch.start > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, urlMatch.start)
      });
    }
    
    // URL 세그먼트 추가
    segments.push({
      type: 'url',
      content: urlMatch.displayUrl,
      url: urlMatch.url
    });
    
    lastIndex = urlMatch.end;
  });
  
  // 마지막 URL 이후의 텍스트 추가
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }
  
  return segments;
}

/**
 * URL이 유효한지 검증합니다.
 * @param url 검증할 URL
 * @returns 유효성 여부
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // www로 시작하는 경우 https를 붙여서 다시 시도
    if (url.startsWith('www.')) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}