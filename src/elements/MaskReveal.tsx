import { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { gsap } from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';
import { calculateMaskGradientAngle } from '../utils/textHelper';
gsap.registerPlugin(GSDevTools);

const MaskReveal = () => {
  const textRef = useRef(null);
  const maskRef = useRef(null);
  const angleInDeg = 90;
  const { x1, y1, x2, y2 } = calculateMaskGradientAngle(angleInDeg);
  useEffect(() => {
    const tl = gsap.timeline({ repeat: null });

    tl.fromTo(
      maskRef.current,
      { x: 275 },
      {
        x: 600,
        duration: 3,
        // ease: 'expo.inOut',
      },
    );
    tl.fromTo(
      textRef.current,
      {
        x: 375,
      },
      {
        x: 0,
        duration: 3,
        // ease: 'expo.inOut',
      },
      '<',
    );
    GSDevTools.create({ animation: tl });
  }, []);

  return (
    <>
      {/* Background Rect */}

      {/* Group to apply clipping */}
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            name="transparentBackground"
            width={window.innerWidth}
            height={window.innerHeight}
            x={0}
            y={0}
            fill="green"
          />

          <Group width={600} height={140} fill="black">
            <Text
              ref={textRef}
              text="REVEAL"
              fontSize={140}
              fill="black"
              align="center"
              width={600}
              height={140}
              scaleX={0.50493}
              scaleY={0.50494}
              x={0}
              y={0}
            />
            <Rect
              ref={maskRef}
              name="transparentBackground"
              width={600}
              height={140}
              x={0}
              y={0}
              fillPriority="linear-gradient"
              fillLinearGradientStartPoint={{ x: x1, y: y1 }}
              fillLinearGradientEndPoint={{ x: x2, y: y2 }}
              fillLinearGradientColorStops={[0, 'rgb(0, 128, 0,0 )', 0.2, 'rgb(0, 128, 0,1 )']}
            />
          </Group>
        </Layer>
      </Stage>
    </>
  );
};

export default MaskReveal;
