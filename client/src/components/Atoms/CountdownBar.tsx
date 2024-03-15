import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CountdownTimerProps {
  time: number;
  onCountdownFinish?: () => void;
  backgroundColor?: string;
  foregroundColor?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  time,
  onCountdownFinish = () => void 0,
  backgroundColor = 'bg-gray-100',
  foregroundColor = 'bg-amber-500',
}) => {
  const [remainingTime, setRemainingTime] = useState<number>(time);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startTimer = () => {
      if (remainingTime <= 0) {
        clearInterval(intervalRef.current as NodeJS.Timeout);
        onCountdownFinish();
        return;
      }

      intervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          const updatedTime = prevTime - 1;
          if (updatedTime <= 0) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            onCountdownFinish();
          }
          return updatedTime;
        });
      }, 1000);
    };

    startTimer();

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [remainingTime, onCountdownFinish]);

  const resetTimer = () => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setRemainingTime(time);
  };

  const calculateWidth = (): number => {
    return (remainingTime / time) * 100;
  };

  return (
    <div className={`w-full ${backgroundColor} h-2 rounded-full overflow-hidden`}>
      <div
        className={`${foregroundColor} h-full transition-all ease-linear duration-1000`}
        style={{ width: `${calculateWidth()}%` }}
      ></div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
        onClick={resetTimer}
      >
        Reset Timer
      </button>
    </div>
  );
};

export default CountdownTimer;
