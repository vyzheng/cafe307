/**
 * Reusable wrapper that animates children with fade-in and slide-up after
 * an optional delay. We use state and useEffect to trigger the animation
 * after delay ms so the child doesn't animate until we want it to.
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
/*
  import SLIDE_DISTANCE_PX — How many pixels the content starts below its final position.
  We set transform to translateY(SLIDE_DISTANCE_PX) when not visible and translateY(0) when visible; the transition makes it slide up as it fades in.
  How far down the content starts before it animates up.
*/
import { SLIDE_DISTANCE_PX } from "../../data/config/animation";

/**
 * Wraps children in a fade-in and slide-up animation after delay ms.
 * Initially opacity is 0 and the content is translated down; after the delay
 * we set isVisible to true and the CSS transition runs.
 */
function FadeIn({ children, delay = 0 }) {
  /*
    const [isVisible, setIsVisible] = useState(false);
    Same useState pattern: we remember a boolean that starts as false.
    isVisible false means the wrapper div has opacity 0 and the content is shifted down by SLIDE_DISTANCE_PX; when we set isVisible to true (after the delay), the div gets opacity 1 and translateY(0), and the transition animates the change.
    Remember whether we've passed the delay yet; until then the content is hidden and lower.
  */
  const [isVisible, setIsVisible] = useState(false);

  /*
    useEffect(() => { ... }, [delay]);
    When the component mounts (or when delay changes), we start a timer: setTimeout(() => setIsVisible(true), delay).
    So after delay ms we set isVisible to true and the animation runs.
    We return a cleanup () => clearTimeout(timeoutId); React calls it when the component unmounts or before the effect runs again, so we cancel the timer.
    The dependency array [delay] means "run this effect when delay changes."
    After delay ms set isVisible to true; if we unmount before that, cancel the timer.
  */
  useEffect(() => {
    const timeoutId = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeoutId);
  }, [delay]);

  /*
    return — The wrapper div's style: opacity is 1 when isVisible is true, 0 otherwise; transform is translateY(0) when visible and translateY(SLIDE_DISTANCE_PX) when not; transition "all 0.7s ease" makes the change animate.
    So when isVisible flips to true, the div fades in and slides up.
    {children} is whatever we wrapped.
    A div that starts invisible and lower; when isVisible becomes true it fades in and slides up; the children render inside it.
  */
  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : `translateY(${SLIDE_DISTANCE_PX}px)`,
      transition: "all 0.7s ease",
    }}>
      {children}
    </div>
  );
}

/*
  FadeIn.propTypes — We declare that children is required (PropTypes.node: anything React can render) and delay is an optional number.
  So the parent must pass something inside <FadeIn>; delay defaults to 0 in the function signature.
  Document that we need children and that delay is optional.
*/
FadeIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

export default FadeIn;
