import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ANIMATION_ID, DIRECTION } from './animation/config';
import { gsap } from 'gsap';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { GSDevTools } from 'gsap/GSDevTools';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(GSDevTools, PhysicsPropsPlugin, CustomBounce, CustomEase);
CustomEase.create('rise', '0.7004830917874396, 0, 0.4669565217391304, 0.9855072463768115');

const GSAPContext = createContext({
  isPlayingYTimeline: false,
  isTimelineReady: false,
  registerTween: (tween: GSAPTween) => {},
  playTimeline: () => {},
  resetTimeline: () => {},
  pauseTimeline: () => {},
  clearTimeline: () => {},
  progressTimeline: 0,
  setProgressTimeline: (progress: number) => {},
  direction: DIRECTION.UP,
  setDirection: (direction: string) => {},
  animationId: ANIMATION_ID.WIPE,
  setAnimationId: (animationId: string) => {},
});

export const GSAPProvider = ({ children }) => {
  const [isTimelineReady, setIsTimelineReady] = useState(false);
  const [direction, setDirection] = useState(DIRECTION.UP);
  const [animationId, setAnimationId] = useState(ANIMATION_ID.WIPE);

  const [progress, setProgress] = useState(0);
  const timelineRef = useRef(gsap.timeline({ paused: true }));

  const registerTween = (tween) => {
    if (timelineRef.current.getChildren().length > 0) {
      timelineRef.current.clear();
    }
    timelineRef.current.add(tween);
  };

  const playTimeline = () => {
    timelineRef.current.restart().play();
  };

  const resetTimeline = () => {
    timelineRef.current.restart().pause();
  };

  const pauseTimeline = () => {
    timelineRef.current.pause();
  };

  const clearTimeline = () => {
    if (timelineRef.current && timelineRef.current.getChildren().length > 0) {
      timelineRef.current.clear();
    }
  };

  useEffect(() => {
    timelineRef.current = gsap.timeline({
      paused: true,
      onUpdate: () => {
        setProgress(timelineRef.current.progress() * 100);
      },
    });
    setIsTimelineReady(true);
    return () => {
      timelineRef.current.kill();
    };
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.progress(progress / 100);
    }
  }, [progress]);

  return (
    <GSAPContext.Provider
      value={{
        isPlayingTimeline: timelineRef.current.isActive(),
        isTimelineReady,
        registerTween,
        playTimeline,
        resetTimeline,
        pauseTimeline,
        clearTimeline,
        progressTimeline: progress,
        setProgressTimeline: setProgress,
        direction: direction,
        setDirection: setDirection,
        animationId: animationId,
        setAnimationId: setAnimationId,
      }}
    >
      {children}
    </GSAPContext.Provider>
  );
};

export const useGSAP = () => {
  return useContext(GSAPContext);
};
