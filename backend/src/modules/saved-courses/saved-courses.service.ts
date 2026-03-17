import * as repository from "./saved-courses.repository";

export async function toggleSavedCourse(userId: number, playlistId: string) {
  const isSaved = await repository.isCourseSaved(userId, playlistId);
  if (isSaved) {
    await repository.unsaveCourse(userId, playlistId);
    return { saved: false };
  } else {
    await repository.saveCourse(userId, playlistId);
    return { saved: true };
  }
}

export async function getSavedCourses(userId: number) {
  return repository.listSavedCourses(userId);
}

export async function getSavedPlaylistIds(userId: number) {
  return repository.getSavedPlaylistIds(userId);
}
