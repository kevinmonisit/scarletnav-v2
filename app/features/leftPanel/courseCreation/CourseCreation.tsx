import { CoursesBySemesterID } from "@/types/models";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "../../middlePanel/dashboard/components/SortableItem";

export const COURSE_CREATION_CONTAINER_ID = 'COURSE_CREATION_CONTAINER_ID';
export const COURSE_CREATION_COURSE_ID = '!_new_c_!';

export default function CourseCreation() {

  const items: CoursesBySemesterID = {
    COURSE_CREATION_CONTAINER_ID: ['1', '2', '3']
  }

  return (
    <div>
      <h1>Course Creation</h1>
      <SortableContext items={['1']} strategy={verticalListSortingStrategy}>
        <SortableItem
          containerId={COURSE_CREATION_CONTAINER_ID}
          id={COURSE_CREATION_COURSE_ID}
          index={0}
          handle={false}
          renderItem={() => <div>1</div>}
          style={() => ({})}
          wrapperStyle={() => ({})}
          getIndex={() => 0}
        />
      </SortableContext>
    </div>
  );
}