import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Text } from 'react-konva';
import gsap from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase, GSDevTools);

const textDefaultAttributes = {
  x: 100,
  y: 100,
  scaleX: 1,
  scaleY: 1,
  width: 200,
  height: 300,
  text: 'Tân Phạm',
  fontSize: 30,
};

const wordAttributes = [
  { x: 100, y: 100, scaleX: 1, scaleY: 1, text: 'Tân' },
  { x: 160, y: 100, scaleX: 1, scaleY: 1, text: 'Phạm' },
];

const characterText = 'AAAAAAAAAAAAAAAAAAAAAAA';
const characterText2 = 'bbbbbbbbbbbbbbbbbbbbbbb';
const TestText = () => {
  const wordRefs = useRef([]);
  const charRefs = useRef([]);
  const charRefs2 = useRef([]);

  useEffect(() => {
    if (wordRefs.current.length === 0 || charRefs.current.length === 0) return;
    wordRefs.current.forEach((charRef) => {
      const size = charRef.getSelfRect();
      console.log(size);
    });
    charRefs2.current.forEach((charRef) => {
      const size = charRef.getSelfRect();
      charRef.offsetX(size.width / 2);
      charRef.offsetY(size.height / 2);
    });

    const tl = gsap.timeline({ defaults: { duration: 1, ease: 'power2.out' } });

    tl.fromTo(
      wordRefs.current,
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 50,
        stagger: {
          amount: 1,
        },
      },
    );

    tl.fromTo(
      charRefs.current,
      { opacity: 0 },
      {
        opacity: 1,
        stagger: {
          amount: 1,
        },
      },
    );
    tl.fromTo(
      charRefs2.current,
      {
        scaleX: 0,
        scaleY: 0,
      },
      {
        scaleX: 1,
        scaleY: 1,
        ease: CustomEase.create('custom', 'M0,0 C0.078,0.153 0.336,1.065 0.665,1.299 0.774,1.376 0.873,1 1,1 '),
        stagger: {
          amount: 1,
        },
      },
    );

    GSDevTools.create();
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text {...textDefaultAttributes} />
        {wordAttributes.map((attr, index) => (
          <Text key={index} ref={(el) => (wordRefs.current[index] = el)} {...attr} fontSize={30} draggable />
        ))}
        {characterText.split('').map((char, index) => (
          <Text
            key={index}
            ref={(el) => (charRefs.current[index] = el)}
            text={char}
            fontSize={30}
            x={400 + index * 18} // Adjust x position based on index
            y={100} // Position below the words
            draggable
          />
        ))}

        {characterText2.split('').map((char, index) => (
          <Text
            key={index}
            ref={(el) => (charRefs2.current[index] = el)}
            text={char}
            fontSize={30}
            x={400 + index * 18} // Adjust x position based on index
            y={400} // Position below the words
            draggable
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default TestText;
