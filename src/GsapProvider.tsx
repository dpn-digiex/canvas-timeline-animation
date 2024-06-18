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
  resetTimeline: () => {},
  pauseTimeline: () => {},
  resumeTimeline: () => {},
  clearTimeline: () => {},
  progressTimeline: 0,
  setProgressTimeline: (progress: number) => {},
});

export const GSAPProvider = ({ children }) => {
  const [isTimelineReady, setIsTimelineReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timelineStatus, setTimelineStatus] = useState(TIMELINE_STATUS.IDLE);

  const [triggerUpdateTweens, setTriggerUpdateTweens] = useState(false);
  const [updatedTweentCount, setUpdatedTweenCount] = useState(0);

  const timelineRef = useRef(gsap.timeline({ paused: true }));

  const registerTween = (tween, delay) => {
    timelineRef.current.add(tween, delay);
  };

  const updateTween = (id, newTween) => {
    const children = timelineRef.current.getChildren();
    const index = children.findIndex((t) => t.vars.id === id);
    if (index !== -1) {
      timelineRef.current.remove(children[index]);
      timelineRef.current.add(newTween, children[index].startTime());
    }
  };

  const removeTween = (id) => {
    const children = timelineRef.current.getChildren();
    const index = children.findIndex((t) => t.vars.id === id);
    if (index !== -1) {
      timelineRef.current.remove(children[index]);
    }
  };

  const prepapeTimeline = () => {
    setTriggerUpdateTweens(true);
  };

  const playTimeline = (seekTime) => {
    if (seekTime) {
      timelineRef.current.seek(seekTime).play();
    } else {
      timelineRef.current.restart().play();
    }
    setUpdatedTweenCount(0);
    setTimelineStatus(TIMELINE_STATUS.PLAYING);
  };

  const resetTimeline = () => {
    timelineRef.current.restart().pause();
    setTimelineStatus(TIMELINE_STATUS.IDLE);
  };

  const pauseTimeline = () => {
    timelineRef.current.pause();
    setTimelineStatus(TIMELINE_STATUS.PAUSED);
  };

  const resumeTimeline = () => {
    timelineRef.current.resume();
    setTimelineStatus(TIMELINE_STATUS.PLAYING);
  };

  const clearTimeline = () => {
    if (timelineRef.current && timelineRef.current.getChildren().length > 0) {
      timelineRef.current.clear();
    }
  };

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

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.progress(progress / 100);
    }
  }, [progress]);

  return (
    <GSAPContext.Provider
      value={{
        timelineStatus: timelineStatus,
        elapsedTime: timelineRef.current.time(),
        totalTime: timelineRef.current.totalDuration(),
        isPlayingTimeline: timelineRef.current.isActive(),
        isTimelineReady,
        registerTween,
        updateTween,
        removeTween,
        playTimeline,
        resetTimeline,
        pauseTimeline,
        resumeTimeline,
        clearTimeline,
        progressTimeline: progress,
        setProgressTimeline: setProgress,
      }}
    >
      {children}
    </GSAPContext.Provider>
  );
};

export const useGSAP = () => {
  return useContext(GSAPContext);
};
