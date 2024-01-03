import { CourseID } from "@/types/models";
import { UniqueIdentifier } from "@dnd-kit/core/dist/types";

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

/**
 * Holds semester IDs as keys with their course IDs ordered
 * the way the UI renders them.
 */
export interface dashboardOverviewState {
  [semesterID: UniqueIdentifier]: CourseID[];
}
