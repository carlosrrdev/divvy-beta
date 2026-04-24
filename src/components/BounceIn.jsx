import { useSpring, animated } from '@react-spring/web';

export default function BounceIn({ children }) {
  const spring = useSpring({
    from: { opacity: 0, transform: 'scale(0.88) translateY(10px)' },
    to:   { opacity: 1, transform: 'scale(1) translateY(0px)' },
    config: { tension: 330, friction: 22 },
  });
  return <animated.div style={spring}>{children}</animated.div>;
}