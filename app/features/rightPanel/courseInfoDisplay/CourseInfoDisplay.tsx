import useAuxiliaryStore from "@/lib/hooks/stores/useAuxiliaryStore";

export default function CourseInfoDisplay() {

  const id = useAuxiliaryStore((state) => state.currentInfoCourseID);
  //const {name, credits} = getCourseMetadata(id);

  return (
    <div
      className="w-full h-full flex flex-col bg-red-100"
    >
      Current Course Name: {id}
    </div>
  );
}