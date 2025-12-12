/**
 * Utility functions for URL slugs
 */

/**
 * Convert a string to URL-friendly slug
 * Example: "My Awesome Idea!" -> "my-awesome-idea"
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Create a username slug for profile URLs
 * Example: "John Doe" -> "john-doe"
 */
export function createUsernameSlug(username: string): string {
  return createSlug(username);
}

/**
 * Create a unique slug with ID suffix for guaranteed uniqueness
 * Example: "My Idea" with id "abc123" -> "my-idea-abc123"
 * @deprecated Use createSlug instead - slugs are now stored in database
 */
export function createUniqueSlug(text: string, id: string): string {
  const slug = createSlug(text);
  const shortId = id.slice(0, 8); // Use first 8 chars of ID
  return `${slug}-${shortId}`;
}

/**
 * Create idea/project slug - just the title without ID
 * Example: "My Awesome Idea" -> "my-awesome-idea"
 */
export function createIdeaSlug(title: string): string {
  return createSlug(title);
}

/**
 * Extract ID from a slug that contains ID suffix
 * Example: "my-idea-abc12345" -> "abc12345" (assuming 8 char ID)
 */
export function extractIdFromSlug(slug: string): string | null {
  // The ID is the last segment after the final hyphen, if it looks like a UUID prefix
  const parts = slug.split("-");
  if (parts.length < 2) return null;

  const lastPart = parts[parts.length - 1];
  // Check if it looks like a UUID prefix (alphanumeric, 8 chars)
  if (/^[a-f0-9]{8}$/i.test(lastPart)) {
    return lastPart;
  }

  // If not a UUID prefix, return the full slug (might be just an ID)
  return slug;
}

/**
 * Check if a string looks like a slug (contains only lowercase, numbers, hyphens)
 */
export function isValidSlug(str: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str);
}
