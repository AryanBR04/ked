const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractYoutubeVideoId(input: string): string | null {
  if (YOUTUBE_ID_REGEX.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    if (url.hostname.includes("youtu.be")) {
      const shortId = url.pathname.replace("/", "");
      return YOUTUBE_ID_REGEX.test(shortId) ? shortId : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId && YOUTUBE_ID_REGEX.test(watchId)) {
        return watchId;
      }

      const embedId = url.pathname.split("/").filter(Boolean).pop() ?? "";
      return YOUTUBE_ID_REGEX.test(embedId) ? embedId : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYoutubeEmbedUrl(input: string): string | null {
  const videoId = extractYoutubeVideoId(input);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

