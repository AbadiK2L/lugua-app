import type { Href } from "expo-router";

export type StudentCourseRouteParams = {
  classId: string;
  courseId: string;
};

export function getStudentCourseHref({
  classId,
  courseId,
}: StudentCourseRouteParams): Href {
  const encodedClassId = encodeURIComponent(classId);
  const encodedCourseId = encodeURIComponent(courseId);

  return `/student/class/${encodedClassId}/course/${encodedCourseId}` as Href;
}
