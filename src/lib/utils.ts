/**
 * Get the full URL for a media file from the server
 * @param path - The relative path or URL of the media file
 * @returns The full URL with MEDIA_URL base, or undefined if path is falsy
 */
export function getMediaUrl(
  path: string | undefined | null,
): string | undefined {
  if (!path) return undefined;

  // If already a full URL, return as is
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || "";

  // Remove leading slash from path if media URL ends with slash
  const cleanPath =
    path.startsWith("/") && mediaUrl.endsWith("/") ? path.slice(1) : path;

  // Add leading slash if neither has it
  const separator =
    !mediaUrl.endsWith("/") && !cleanPath.startsWith("/") ? "/" : "";

  return `${mediaUrl}${separator}${cleanPath}`;
}
