/**
 * Utility functions for comment processing
 */

import { Comment } from './types';

/**
 * Transforms a flat list of comments into a nested tree structure
 * where replies are nested under their parent comments
 */
export function buildCommentTree(flatComments: Comment[]): Comment[] {
  // Create a map for quick lookup
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: Create a map of all comments and initialize replies array
  flatComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: Build the tree structure
  flatComments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id);
    if (!commentWithReplies) return;

    if (comment.parentCommentId) {
      // This is a reply - add it to parent's replies
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      } else {
        // Parent not found (orphaned comment), treat as root comment
        rootComments.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}
