"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
// import IaiyiRems from "@/app/constants/aiyiRem";
import useWindow from "@/app/hooks/useWindow";
import { scrollTopContext } from "./layout";
import { randomColor } from "../utils/randomColor";
import LoginCard from "./components/loginCard";
export default function Page() {
  // const aiyiRems = IaiyiRems;
  const rotateDEG = 20;
  const stickyHeightVH = 50;

  const { scrollTop, controlScrollTop } = useContext(scrollTopContext);

  useEffect(() => {
    controlScrollTop(window.innerHeight * 1.5);
  }, []);

  const { width: kilaInnerWidth, height: kilaInnerHeight } = useWindow();
  // control stickyRef translateX
  useEffect(() => {
    if (stickyTopRef.current && scrollRef.current) {
      stickyTopRef.current.style.transform = `rotate(${rotateDEG}deg) translateX(-${scrollTop >= stickyTopRef.current.scrollWidth - kilaInnerWidth
        ? stickyTopRef.current.scrollWidth - kilaInnerWidth
        : scrollTop
        }px)`;
    }
    if (stickyMiddleRef.current && scrollRef.current) {
      stickyMiddleRef.current.style.transform = `rotate(${rotateDEG}deg) translateX(-${stickyMiddleRef.current.scrollWidth - kilaInnerWidth - scrollTop <= 0
        ? 0
        : stickyMiddleRef.current.scrollWidth - kilaInnerWidth - scrollTop
        }px)`;
    }
    if (stickyBottomRef.current && scrollRef.current) {
      stickyBottomRef.current.style.transform = `rotate(${rotateDEG}deg) translateX(-${scrollTop >= stickyBottomRef.current.scrollWidth - kilaInnerWidth
        ? stickyBottomRef.current.scrollWidth - kilaInnerWidth
        : scrollTop
        }px)`;
    }
  }, [kilaInnerWidth, scrollTop]);

  // control scrollRef height
  useEffect(() => {
    if (stickyTopRef.current && scrollRef.current) {
      scrollRef.current.style.height =
        String(
          stickyTopRef.current.scrollWidth - kilaInnerWidth + kilaInnerHeight
        ) + "px";
    }
  }, [kilaInnerWidth, kilaInnerHeight]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickyTopRef = useRef<HTMLDivElement | null>(null);
  const stickyMiddleRef = useRef<HTMLDivElement | null>(null);
  const stickyBottomRef = useRef<HTMLDivElement | null>(null);

  const [shuffledAiyiRems0, setShuffledAiyiRems0] = useState(randomColor(20));
  const [shuffledAiyiRems1, setShuffledAiyiRems1] = useState(randomColor(20));
  const [shuffledAiyiRems2, setShuffledAiyiRems2] = useState(randomColor(20));
  // useEffect(() => {
  //   setShuffledAiyiRems0([...aiyiRems].sort(() => Math.random() - 0.5));
  //   setShuffledAiyiRems1([...aiyiRems].sort(() => Math.random() - 0.5));
  //   setShuffledAiyiRems2([...aiyiRems].sort(() => Math.random() - 0.5));
  // }, [aiyiRems]);

  return (
    <div
      className="w-full min-h-screen relative bg-[#91bef0]"
      ref={scrollRef}
    >
      <div
        className={` sticky left-0 flex w-auto transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)] duration-100 `}
        style={{
          top:
            String(
              (100 - stickyHeightVH) / 2 -
              stickyHeightVH / Math.cos((rotateDEG * Math.PI) / 180)
            ) + "vh",
          height: String(stickyHeightVH) + "vh",
        }}
        ref={stickyTopRef}
      >
        {shuffledAiyiRems0.map((aiyiRem: string) => (
          <div className=" aspect-[9/16] h-full" key={aiyiRem}>
            {/* <Image
              src={aiyiRem}
              width={200}
              height={300}
              className="w-full h-full object-cover"
              alt="aiyiRem"
            ></Image> */}
            <div className="w-full h-full " style={{ backgroundColor: aiyiRem }}></div>
          </div>
        ))}
      </div>
      <div
        className={` sticky left-0 flex w-auto transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)] duration-100 `}
        style={{
          top: String((100 - stickyHeightVH) / 2) + "vh",
          height: String(stickyHeightVH) + "vh",
        }}
        ref={stickyMiddleRef}
      >
        {shuffledAiyiRems1.map((aiyiRem: string) => (
          <div className=" aspect-[9/16] h-full" key={aiyiRem}>
            {/* <Image
              src={aiyiRem}
              width={200}
              height={300}
              className="w-full h-full object-cover"
              alt="aiyiRem"
            ></Image> */}
            <div className="w-full h-full " style={{ backgroundColor: aiyiRem }}></div>
          </div>
        ))}
      </div>
      <div
        className={` sticky flex w-auto transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)] duration-100 `}
        style={{
          top:
            String(
              (100 - stickyHeightVH) / 2 +
              stickyHeightVH / Math.cos((rotateDEG * Math.PI) / 180)
            ) + "vh",
          height: String(stickyHeightVH) + "vh",
        }}
        ref={stickyBottomRef}
      >
        {shuffledAiyiRems2.map((aiyiRem: string) => (
          <div className=" aspect-[9/16] h-full" key={aiyiRem}>
            {/* <Image
              src={aiyiRem}
              width={200}
              height={300}
              className="w-full h-full object-cover"
              alt="aiyiRem"
            ></Image> */}
            <div className="w-full h-full " style={{ backgroundColor: aiyiRem }}></div>
          </div>
        ))}
      </div>

      <LoginCard></LoginCard>

    </div>
  );
}
