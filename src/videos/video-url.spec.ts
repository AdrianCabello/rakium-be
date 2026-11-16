import { isSupportedVideoUrl } from './videos.service';

describe('isSupportedVideoUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.instagram.com/reel/C9xYz123AbC/',
    'https://www.instagram.com/p/C9xYz123AbC/?igsh=abc',
    'instagram.com/reels/C9xYz123AbC',
  ])('accepts %s', (url) => {
    expect(isSupportedVideoUrl(url)).toBe(true);
  });

  it.each(['https://vimeo.com/123', 'https://www.instagram.com/celinagstudio/', 'https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ'])(
    'rejects %s',
    (url) => {
      expect(isSupportedVideoUrl(url)).toBe(false);
    },
  );
});
