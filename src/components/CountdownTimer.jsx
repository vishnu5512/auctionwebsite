import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

const CountdownTimer = ({ endDate, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false); // Less than 5 mins

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        totalMs: difference,
      };
    } else {
      timeLeft = { totalMs: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const calculated = calculateTimeLeft();
      setTimeLeft(calculated);

      if (calculated.totalMs === 0) {
        setIsExpired(true);
        clearInterval(timer);
        if (onEnd) onEnd();
      } else {
        // Less than 5 minutes (5 * 60 * 1000 = 300,000 ms)
        setIsUrgent(calculated.totalMs < 300000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired || timeLeft.totalMs === 0) {
    return (
      <span className="badge badge-ended d-inline-flex align-items-center py-2 px-3 fw-semibold">
        <FaClock className="me-1" />
        Auction Ended
      </span>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  // Formatting output
  let timerString = '';
  if (days > 0) timerString += `${days}d `;
  if (days > 0 || hours > 0) timerString += `${hours.toString().padStart(2, '0')}h `;
  timerString += `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  return (
    <span
      className={`badge d-inline-flex align-items-center py-2 px-3 fw-semibold transition-smooth ${
        isUrgent
          ? 'bg-danger border border-danger text-white glow-danger'
          : 'bg-dark border border-secondary text-info'
      }`}
      style={isUrgent ? { boxShadow: '0 0 10px rgba(220, 53, 69, 0.4)' } : {}}
    >
      <FaClock className={`me-1 ${isUrgent ? 'animate-pulse' : ''}`} />
      {timerString}
    </span>
  );
};

export default CountdownTimer;
