import { useRef, useEffect, useState } from "react";

const useAnimation = ({ from, to, duration = 1000, easing }) => {
  const requestRef = useRef();
  const startTimeRef = useRef();
  const pauseTimeRef = useRef();
  const elapsedTimeRef = useRef(0);
  const [value, setValue] = useState(from);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const play = () => {
    setIsPlaying(true);
    setIsPaused(false);
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const pause = () => {
    setIsPlaying(false);
    setIsPaused(true);
    cancelAnimationFrame(requestRef.current);
    pauseTimeRef.current = performance.now();
    elapsedTimeRef.current += pauseTimeRef.current - startTimeRef.current;
  };

  const stop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    cancelAnimationFrame(requestRef.current);
  };

  const resume = () => {
    if (isPaused) {
      setIsPlaying(true);
      setIsPaused(false);
      startTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    cancelAnimationFrame(requestRef.current);
    setValue(from);
    startTimeRef.current = null;
    pauseTimeRef.current = null;
    elapsedTimeRef.current = 0;
  };

  const animate = (time) => {
    if (!startTimeRef.current) {
      startTimeRef.current = time;
    }
    const elapsed = time - startTimeRef.current + elapsedTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const currentValue = from + (to - from) * easedProgress;
    setValue(currentValue);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, from, to, duration, easing]);

  return { value, play, pause, stop, resume, reset };
};

export default useAnimation;
