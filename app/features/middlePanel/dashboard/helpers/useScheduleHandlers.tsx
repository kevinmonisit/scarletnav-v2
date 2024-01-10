import { createDummySchedule } from "@/lib/api/scheduleAPI";
import { indexDB } from "@/lib/client/indexDB";
import { UniqueIdentifier } from "@dnd-kit/core";
import { unstable_batchedUpdates } from "react-dom";
import { getNextContainerId } from "./utilities";
import { useScheduleStore } from "@/lib/stores/useScheduleStore";

export default function useScheduleHandlers() {

  const items = useScheduleStore((state) => state.coursesBySemesterID);
  const containers = useScheduleStore((state) => state.semesterOrder);
  const setSemesterOrder = useScheduleStore((state) => state.setSemesterOrder);
  const setCoursesBySemesterID = useScheduleStore((state) => state.setCoursesBySemesterID);

  const handleAddColumn = () => {
    // indexDB.setSchedule(createDummySchedule());
    const newContainerId = getNextContainerId(items);

    unstable_batchedUpdates(() => {
      setSemesterOrder([...containers, newContainerId]);
      setCoursesBySemesterID({
        ...items,
        [newContainerId]: [],
      });
    });
  }

  const handleRemove = (
    containerID: UniqueIdentifier,
  ) => {
    setSemesterOrder(containers.filter((id) => id !== containerID));
  }

  return {
    handleRemove,
    handleAddColumn,
  }
}