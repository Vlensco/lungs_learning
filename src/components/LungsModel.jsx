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

          // Trachea parts highlight mapping
          const isTracheaRelated = activePart.id.startsWith('trachea') || 
                                   activePart.id === 'kartilago-trakea' || 
                                   activePart.id === 'karina' || 
                                   activePart.id === 'ligamenta-annularia' ||
                                   activePart.id === 'trakea';
          if (isTracheaRelated && objNameNorm.includes('trakea')) {
            isCurrentPart = true;
          }

          // Bronchus parts highlight mapping
          const isBronchusRelated = activePart.id.startsWith('bronkus') || 
                                    activePart.id.startsWith('bronkiolus') || 
                                    activePart.id === 'otot-polos' || 
                                    activePart.id === 'alveoli';
          if (isBronchusRelated && objNameNorm.includes('bronkus')) {
            isCurrentPart = true;
          }

          // Pleura parts highlight mapping (light up both lungs)
          const isPleuraRelated = activePart.layer.id.includes('Pleura') || 
                                  activePart.id.startsWith('pleura') || 
                                  activePart.id === 'cavitas-pleuralis';
          if (isPleuraRelated && (objNameNorm.includes('lobus') || objNameNorm.includes('paru'))) {
            isCurrentPart = true;
          }

          // Special Pulmo mappings
          if (activePart.id === 'lobus-superior-kanan' && objNameNorm.includes('lobussuperiorkanan')) {
            isCurrentPart = true;
          }
          if (activePart.id === 'lobus-medial-kanan' && objNameNorm.includes('lobusmediuskanan')) {
            isCurrentPart = true;
          }
          if (activePart.id === 'lobus-inferior-kanan' && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusinferiorkanandalam'))) {
            isCurrentPart = true;
          }
          if (activePart.id === 'lobus-superior-kiri' && (objNameNorm.includes('lobussuperiorkiri') || objNameNorm.includes('lobussuperiorkiridalam'))) {
            isCurrentPart = true;
          }
          if (activePart.id === 'lobus-inferior-kiri' && objNameNorm.includes('lobusinferiorkiri')) {
            isCurrentPart = true;
          }

          // Fissures
          if (activePart.id === 'fisura-horizontal-kanan' && (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobusmediuskanan'))) {
            isCurrentPart = true;
          }
          if (activePart.id === 'fisura-oblique-kanan' && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusmediuskanan') || objNameNorm.includes('lobussuperiorkanan'))) {
            isCurrentPart = true;
          }
          if (activePart.id === 'fisura-oblique-kiri' && (objNameNorm.includes('lobussuperiorkiri') || objNameNorm.includes('lobusinferiorkiri'))) {
            isCurrentPart = true;
          }

          // Landmarks
          if (activePart.id === 'apex-pulmonis' && (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobussuperiorkiri'))) {
            isCurrentPart = true;
          }
          if (activePart.id === 'basis-pulmonis' && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusinferiorkiri'))) {
            isCurrentPart = true;
          }
          if ((activePart.id === 'radix-pulmonis' || activePart.id === 'hilum-pulmonis' || activePart.id === 'ligamentum-pulmonale') && (objNameNorm.includes('lobus') || objNameNorm.includes('bronkus'))) {
            isCurrentPart = true;
          }
          if (activePart.id === 'margo-anterior' && (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobussuperiorkiri') || objNameNorm.includes('lobusmediuskanan'))) {
            isCurrentPart = true;
          }
          if ((activePart.id === 'margo-inferior' || activePart.id === 'margo-posterior') && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusinferiorkiri'))) {
            isCurrentPart = true;
          }
          if ((activePart.id === 'incisura-cardiaca' || activePart.id === 'lingula-pulmonis') && objNameNorm.includes('lobussuperiorkiri')) {
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
