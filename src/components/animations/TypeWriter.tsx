import { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
  style?: React.CSSProperties;
}

export default function TypeWriter({ text, speed = 40, style }: TypeWriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => { setDisplayed(''); setIndex(0); }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [index, text, speed]);

  return (
    <span style={style}>
      {displayed}
      <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  );
}
