export interface Alignment {
  vertical?:
    | "middle"
    | "top"
    | "bottom"
    | "distributed"
    | "justify"
    | undefined;
  horizontal?:
    | "distributed"
    | "justify"
    | "left"
    | "right"
    | "center"
    | "fill"
    | "centerContinuous"
    | undefined;
};
