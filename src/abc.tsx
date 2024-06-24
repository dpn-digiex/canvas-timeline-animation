import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { TIMELINE_STATUS } from './animation/config';
import { gsap } from 'gsap';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { GSDevTools } from 'gsap/GSDevTools';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(GSDevTools, PhysicsPropsPlugin, CustomBounce, CustomEase);
CustomEase.create('rise', '0.7004830917874396, 0, 0.4669565217391304, 0.9855072463768115');

const GSAPContext = createContext({
  timelineStatus: TIMELINE_STATUS.IDLE,
  elapsedTime: 0,
  totalTime: 0,
  isPlayingTimeline: false,
  isTimelineReady: false,
  registerTween: (tween: GSAPTween, delay?: number) => {},
  updateTween: (id: string, newTween: GSAPTween) => {},
  removeTween: (id: string) => {},
  playTimeline: (seekTime?: number) => {},
  prepareTimeline: () => {},
  resetTimeline: () => {},
  pauseTimeline: () => {},
  resumeTimeline: () => {},
  clearTimeline: () => {},
  progressTimeline: 0,
  setProgressTimeline: (progress: number) => {},
  triggerUpdateTweens: false,
  setTriggerUpdateTweens: (trigger: boolean) => {},
  updatedTweentCount: 0,
  setUpdatedTweenCount: (count: number) => {},
  triggerPreviewAnimation: false,
  setTriggerPreviewAnimation: (trigger: boolean) => {},
  onUpdateTimeline: () => {},
});

export const GSAPProvider = ({ children }) => {
  const [isTimelineReady, setIsTimelineReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timelineStatus, setTimelineStatus] = useState(TIMELINE_STATUS.IDLE);

  const [triggerUpdateTweens, setTriggerUpdateTweens] = useState(false);
  const [updatedTweentCount, setUpdatedTweenCount] = useState(0);

  const [triggerPreviewAnimation, setTriggerPreviewAnimation] = useState(false);

  const timelineRef = useRef(gsap.timeline({ paused: true }));
  const previewRef = useRef(gsap.timeline({ paused: true }));

  const onTimelineUpdateRef = useRef(() => {});

  useEffect(() => {
    timelineRef.current = gsap.timeline({
      paused: true,
      onStart: () => {
        setTimelineStatus(TIMELINE_STATUS.PLAYING);
      },
      onUpdate: () => {
        setProgress(timelineRef.current.progress() * 100);
        if (timelineRef.current.progress() === 0) {
          setTimelineStatus(TIMELINE_STATUS.IDLE);
        } else if (timelineRef.current.progress() === 1) {
          setTimelineStatus(TIMELINE_STATUS.COMPLETED);
        }
        onTimelineUpdateRef.current();
      },
      onComplete: () => {
        setTimelineStatus(TIMELINE_STATUS.COMPLETED);
      },
    });
    setIsTimelineReady(true);
    return () => {
      timelineRef.current.kill();
    };
  }, []);

  return (
    <GSAPContext.Provider
      value={{
        timelineStatus: timelineStatus,
        elapsedTime: timelineRef.current.time(),
        totalTime: timelineRef.current.totalDuration(),
        isPlayingTimeline: timelineRef.current.isActive(),
        isTimelineReady,
        triggerUpdateTweens,
        setTriggerUpdateTweens,
        updatedTweentCount,
        setUpdatedTweenCount,
        progressTimeline: progress,
        setProgressTimeline: setProgress,
        triggerPreviewAnimation,
        setTriggerPreviewAnimation,
        onUpdateTimeline: onTimelineUpdateRef.current,
      }}
    >
      {children}
    </GSAPContext.Provider>
  );
};

export const useGSAP = () => {
  return useContext(GSAPContext);
};
