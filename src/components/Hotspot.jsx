import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

function PulsingAura({ color, active }) {
  const wave1Ref = React.useRef();
  const wave2Ref = React.useRef();

  useFrame(({ clock }) => {
    if (!active) return;
    const time = clock.getElapsedTime();
    
    const p1 = (time * 0.7) % 1.0;
    if (wave1Ref.current) {
      wave1Ref.current.scale.setScalar(1.0 + p1 * 2.2);
      wave1Ref.current.material.opacity = (1.0 - p1) * 0.35;
    }
    
    const p2 = (time * 0.7 + 0.5) % 1.0;
    if (wave2Ref.current) {
      wave2Ref.current.scale.setScalar(1.0 + p2 * 2.2);
      wave2Ref.current.material.opacity = (1.0 - p2) * 0.35;
    }
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={wave1Ref}>
        <sphereGeometry args={[0.015, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={wave2Ref}>
        <sphereGeometry args={[0.015, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Hotspot({ part, active, showLabels, onSelect, lang }) {
  return (
    <group position={part.position}>
      <PulsingAura color={part.color} active={active} />
      
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(part.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[active ? 0.011 : 0.008, 28, 28]} />
        <meshStandardMaterial
          color={part.color}
          emissive={part.color}
          emissiveIntensity={active ? 1.85 : 0.55}
          roughness={0.24}
          metalness={0.05}
        />
      </mesh>
      
      <mesh scale={active ? 1.55 : 1.08}>
        <sphereGeometry args={[0.0125, 28, 28]} />
        <meshBasicMaterial color={part.color} transparent opacity={active ? 0.22 : 0.09} />
      </mesh>
      
      {/* Dynamic flat billboard 2D label with pointer lines for the ACTIVE item */}
      {active && (
        <Html center occlude={false} zIndexRange={[100, 50]}>
          <div className="leader-label-container" style={{ '--accent': part.color }}>
            <svg className="leader-svg" width="100" height="40">
              <path d="M 0,20 L 40,20 L 60,8 L 100,8" fill="none" stroke={part.color} strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="0" cy="20" r="3" fill={part.color} />
            </svg>
            <div className="flat-leader-label">
              <span className="label-tag">{part.layer[lang]}</span>
              <span className="label-title">{part.name[lang]}</span>
            </div>
          </div>
        </Html>
      )}

      {/* Minimalist interactive plus (+) pin dots for other items, preventing overlap clutter! */}
      {!active && showLabels && (
        <Html center occlude={false} zIndexRange={[20, 5]}>
          <button 
            className="pin-dot" 
            style={{ '--accent': part.color }}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(part.id);
            }}
          >
            <span className="pin-plus">+</span>
            <span className="pin-tooltip">{part.name[lang]}</span>
          </button>
        </Html>
      )}
    </group>
  );
}
