"use client";

import {
  createContext,
  useCallback,
  useRef,
  useState,
} from "react";
import TWEEN from "@tweenjs/tween.js";

export const scrollTopContext = createContext({
  scrollTop: 0,
  controlScrollTop: (scrollTop: number) => {},
});

export default function ScrollTopLayout({ children }: { children: React.ReactNode }) {
  const boxallRef = useRef<HTMLDivElement>(null);

  const [scrollTop, setScrollTop] = useState(0);

  const naviLoop = useCallback(() => {
    if (boxallRef.current) {
      setScrollTop(boxallRef.current.scrollTop);
    }
  }, [setScrollTop]);


  const controlScrollTop = (FNscrollTop: number) => {
    setScrollTop(FNscrollTop);
    const duration = 400;
    new TWEEN.Tween({ objScrollTop: scrollTop })
      .to({ objScrollTop: FNscrollTop }, duration)
      .onUpdate(function (obj) {
        if (boxallRef.current) boxallRef.current.scrollTop = obj.objScrollTop;
      })
      .start();
    let count = 0;
    function render() {
      TWEEN.update();
      if (count++ > duration / 16.6) return;
      requestAnimationFrame(render);
    }
    render();
  };

  return (
    <scrollTopContext.Provider value={{ scrollTop, controlScrollTop }}>
      <div
        className="overflow-x-hidden overflow-y-scroll w-screen h-screen no-scrollbar text-center m-0 p-0 select-none"
        onScroll={() => {
          naviLoop();
        }}
        ref={boxallRef}
      >
        <div className="w-full min-h-screen">{children}</div>
      </div>
    </scrollTopContext.Provider>
  );
}
