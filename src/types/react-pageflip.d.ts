declare module "react-pageflip" {
  import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

  export interface PageFlipMethods {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    flip: (page: number, corner?: "top" | "bottom") => void;
    turnToPage: (page: number) => void;
    turnToNextPage: () => void;
    turnToPrevPage: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  }

  export interface PageFlipApi {
    pageFlip: () => PageFlipMethods;
  }

  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    startPage?: number;
    className?: string;
    style?: React.CSSProperties;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: "portrait" | "landscape" }) => void;
    children?: ReactNode;
  }

  const HTMLFlipBook: ForwardRefExoticComponent<
    HTMLFlipBookProps & RefAttributes<PageFlipApi>
  >;

  export default HTMLFlipBook;
}
