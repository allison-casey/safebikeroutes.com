import clsx from "clsx";

export const DEFAULT_MAP_STYLE: Styles = "Streets";
export type Styles = "Streets" | "Satellite Streets";
export const MAP_STYLES: { title: Styles; style: string }[] = [
  {
    title: "Streets",
    style: "mapbox://styles/mapbox/streets-v12",
  },
  {
    title: "Satellite Streets",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
  },
] as const;

const StyleSelector = ({
  currentlySelectedStyle,
  onClick,
}: {
  currentlySelectedStyle: Styles;
  onClick: (title: Styles) => void;
}) => (
  <div className="pointer-events-auto absolute flex left-2 bottom-0 mb-12 z-20 rounded-lg drop-shadow-md">
    {MAP_STYLES.map(({ title }) => (
      <div
        onClick={() => onClick(title)}
        key={title}
        className={clsx([
          title === currentlySelectedStyle ? "bg-blue-500" : "bg-white",
          title === currentlySelectedStyle ? "text-white" : "text-gray-500",
          "first:rounded-l",
          "last:rounded-r",
          "py-1",
          "px-2",
          "text-s",
          "font",
          "cursor-pointer",
        ])}
      >
        {title}
      </div>
    ))}
  </div>
);
export default StyleSelector;
