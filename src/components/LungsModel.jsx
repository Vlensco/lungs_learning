import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function LungsModel({ onSurfaceClick, activePart, breathingRate }) {
  const gltf = useGLTF('/models/realistic_human_lungs.glb');
  const groupRef = React.useRef();
  
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = object.material.clone();
        object.material.transparent = true;
        object.material.side = THREE.DoubleSide;
      }
    });
    return cloned;
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      let speed = 1.6;
      let amplitude = 0.022;
      
      if (breathingRate === 0) {
        speed = 0;
        amplitude = 0;
      } else if (breathingRate === 1) {
        speed = 1.6;
        amplitude = 0.022;
      } else if (breathingRate === 2) {
        speed = 3.2;
        amplitude = 0.035;
      }

      const scaleOffset = speed > 0 ? Math.sin(time * speed) * amplitude : 0;
      groupRef.current.scale.set(1 + scaleOffset, 1 + scaleOffset * 0.4, 1 + scaleOffset);
    }
  });

  React.useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        const isAirway = object.name.toLowerCase().includes('part01');
        const isLobe = object.name.toLowerCase().includes('part02');
        
        object.material.roughness = 0.44;
        object.material.metalness = 0.08;

        if (!activePart) {
          object.material.opacity = isAirway ? 0.94 : 0.82;
          object.material.emissive.setHex(0x000000);
        } else {
          const isAirwayPart = activePart.layer.id === 'Saluran Napas' || activePart.layer.id === 'Mikro';
          const isLobePart = activePart.layer.id === 'Lobus Paru' || activePart.layer.id === 'Fisura';

          if (isAirwayPart) {
            if (isAirway) {
              object.material.opacity = 1.0;
              object.material.emissive.set(activePart.color).multiplyScalar(0.48);
              object.material.roughness = 0.22;
            } else {
              object.material.opacity = 0.08;
              object.material.emissive.setHex(0x000000);
            }
          } else if (isLobePart) {
            if (isLobe) {
              object.material.opacity = 0.88;
              object.material.emissive.set(activePart.color).multiplyScalar(0.28);
              object.material.roughness = 0.32;
            } else {
              object.material.opacity = 0.12;
              object.material.emissive.setHex(0x000000);
            }
          } else {
            object.material.opacity = 0.45;
            object.material.emissive.setHex(0x000000);
          }
        }
      }
    });
  }, [scene, activePart]);

  return (
    <primitive
      ref={groupRef}
      object={scene}
      onClick={(event) => {
        event.stopPropagation();
        onSurfaceClick(event.object?.name || 'Lung surface', event.point);
      }}
    />
  );
}

useGLTF.preload('/models/realistic_human_lungs.glb');
