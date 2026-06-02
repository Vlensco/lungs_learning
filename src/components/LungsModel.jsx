// Interactive Human Lungs 3D Model Component - Lungs Learning
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
        const objName = object.name.toLowerCase();
        const isAirway = objName.includes('part01') || objName.includes('trakea') || objName.includes('bronkus');
        const isLobe = objName.includes('part02') || objName.includes('lobus') || objName.includes('paru');
        
        if (isAirway) {
          object.material.roughness = 0.35;
          object.material.metalness = 0.1;
        } else {
          object.material.roughness = 0.15; // glassy finish for lobes
          object.material.metalness = 0.05;
        }

        if (!activePart) {
          object.material.opacity = isAirway ? 1.0 : 0.18;
          object.material.emissive.setHex(0x000000);
        } else {
          const activeIdNorm = activePart.id.toLowerCase().replace(/[\W_]/g, '');
          const objNameNorm = objName.replace(/[\W_]/g, '');

          // Match logic: check if name matches or contains ID
          let isCurrentPart = objNameNorm.includes(activeIdNorm) || activeIdNorm.includes(objNameNorm);

          // Handle special anatomical mappings
          if (activePart.id === 'lobus-medial-kanan' && objNameNorm.includes('lobusmediuskanan')) {
            isCurrentPart = true;
          }
          if (activePart.id === 'trakea' && objNameNorm.includes('trakea')) {
            isCurrentPart = true;
          }
          if (activePart.id.startsWith('bronkus') && objNameNorm.includes('bronkus')) {
            isCurrentPart = true;
          }

          // Fissure highlights: light up adjoining lobes to define boundary lines
          if (activePart.id === 'fisura-horizontal-kanan') {
            if (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobusmediuskanan')) {
              isCurrentPart = true;
            }
          }
          if (activePart.id === 'fisura-oblique-kanan') {
            if (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusmediuskanan') || objNameNorm.includes('lobussuperiorkanan')) {
              isCurrentPart = true;
            }
          }
          if (activePart.id === 'fisura-oblique-kiri') {
            if (objNameNorm.includes('lobussuperiorkiri') || objNameNorm.includes('lobusinferiorkiri')) {
              isCurrentPart = true;
            }
          }

          // Microscopic highlights: light up the bronchial tree as their anatomical origin
          const isMicroPart = activePart.layer.id === 'Mikro' || 
                              activePart.id === 'bronkiolus' || 
                              activePart.id === 'otot-polos-bronkiolus' || 
                              activePart.id === 'sakus-alveolar';
          if (isMicroPart && objNameNorm.includes('bronkus')) {
            isCurrentPart = true;
          }

          if (isCurrentPart) {
            object.material.opacity = 1.0;
            object.material.emissive.set(activePart.color).multiplyScalar(0.48);
            object.material.roughness = isAirway ? 0.22 : 0.32;
          } else {
            // Fade out other non-selected structures
            object.material.opacity = isAirway ? 0.08 : 0.12;
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
