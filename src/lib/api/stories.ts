import apiClient from "./client";
import type {
  StoriesPaginatedResponse,
  Story,
  ToggleLikeResponse,
  StoryCommentsPaginatedResponse,
  StoryComment,
} from "@/types/story";

export async function getExploreStories(
  page = 1,
  limit = 20,
): Promise<StoriesPaginatedResponse> {
  return apiClient.get("/stories/explore", { params: { page, limit } });
}

export async function getFollowingStories(
  page = 1,
  limit = 20,
): Promise<StoriesPaginatedResponse> {
  return apiClient.get("/stories/following", { params: { page, limit } });
}

export async function getVendorStories(vendorId: string): Promise<Story[]> {
  return apiClient.get(`/stories/vendors/${vendorId}`);
}

export async function getStoryById(id: string): Promise<Story> {
  return apiClient.get(`/stories/${id}`);
}

export async function markStoryViewed(id: string): Promise<void> {
  return apiClient.post(`/stories/${id}/view`);
}

// ---------- Likes ----------

export async function toggleStoryLike(
  id: string,
): Promise<ToggleLikeResponse> {
  return apiClient.post(`/stories/${id}/like`);
}

export async function getStoryLikeStatus(
  id: string,
): Promise<{ liked: boolean }> {
  return apiClient.get(`/stories/${id}/like/status`);
}

// ---------- Comments ----------

export async function getStoryComments(
  storyId: string,
  page = 1,
  limit = 20,
): Promise<StoryCommentsPaginatedResponse> {
  return apiClient.get(`/stories/${storyId}/comments`, {
    params: { page, limit },
  });
}

export async function createStoryComment(
  storyId: string,
  content: string,
  parentId?: string,
): Promise<StoryComment> {
  return apiClient.post(`/stories/${storyId}/comments`, {
    content,
    ...(parentId && { parentId }),
  });
}

export async function updateStoryComment(
  commentId: string,
  content: string,
): Promise<StoryComment> {
  return apiClient.put(`/stories/comments/${commentId}`, { content });
}

export async function deleteStoryComment(
  commentId: string,
): Promise<{ message: string }> {
  return apiClient.delete(`/stories/comments/${commentId}`);
}
