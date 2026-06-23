import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, useBounds, ContactShadows, Environment, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import LungsModel from './LungsModel';
import Hotspot from './Hotspot';

function Loader() {
  return (
    <Html center>
      <div className="loader-card">
        <div className="loader-orb" />
        <p>Loading interactive 3D laboratory...</p>
      </div>
    </Html>
  );
}

function PulsingPointLight({ position, color }) {
  const lightRef = React.useRef();
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      const time = clock.getElapsedTime();
      lightRef.current.intensity = 2.0 + Math.sin(time * 5.0) * 1.0;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      distance={0.16}
      color={color}
      castShadow={false}
    />
  );
}

function DiafragmaHighlight({ active }) {
  const meshRef = React.useRef();

  useFrame(({ clock }) => {
    if (active && meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.material.opacity = 0.28 + Math.sin(time * 4.0) * 0.12;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={[0, -0.052, 0.024]} rotation={[Math.PI / 2.05, 0, 0]}>
      <cylinderGeometry args={[0.138, 0.155, 0.028, 48, 5, true]} />
      <meshBasicMaterial color="#65a30d" transparent opacity={0.28} side={THREE.DoubleSide} wireframe />
    </mesh>
  );
}

function BreathingRings({ breathingRate }) {
  const ring1 = React.useRef();
  const ring2 = React.useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    let speed = 1.0;
    if (breathingRate === 0) speed = 0;
    else if (breathingRate === 1) speed = 1.2;
    else if (breathingRate === 2) speed = 2.4;

    const scale1 = 1.0 + (time * speed * 0.4) % 0.5;
    const scale2 = 1.0 + (time * speed * 0.4 + 0.25) % 0.5;
    
    if (ring1.current) {
      ring1.current.scale.setScalar(scale1);
      ring1.current.material.opacity = (1.5 - scale1) * 0.16;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(scale2);
      ring2.current.material.opacity = (1.5 - scale2) * 0.12;
    }
  });

  return (
    <group position={[0, 0.08, 0.02]}>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.124, 0.0012, 8, 96]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.14} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <torusGeometry args={[0.154, 0.0011, 8, 96]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function BoundsController({ activePart, parentGroupRef }) {
  const bounds = useBounds();

  React.useEffect(() => {
    if (parentGroupRef.current) {
      if (activePart) {
        let targetMesh = null;
        parentGroupRef.current.traverse((child) => {
          if (child.isMesh && !targetMesh) {
            const objName = child.name.toLowerCase();
            const objNameNorm = objName.replace(/[\W_]/g, '');
            const activeIdNorm = activePart.id.toLowerCase().replace(/[\W_]/g, '');
            
            let matches = objNameNorm.includes(activeIdNorm) || activeIdNorm.includes(objNameNorm);
            if (activePart.id === 'lobus-medial-kanan' && objNameNorm.includes('lobusmediuskanan')) matches = true;
            if ((activePart.id.startsWith('trachea') || activePart.id === 'kartilago-trakea' || activePart.id === 'karina' || activePart.id === 'ligamenta-annularia') && objNameNorm.includes('trakea')) matches = true;
            if ((activePart.id.startsWith('bronkus') || activePart.id.startsWith('bronkiolus') || activePart.id === 'otot-polos' || activePart.id === 'alveoli') && objNameNorm.includes('bronkus')) matches = true;
            if ((activePart.layer.id.includes('Pleura') || activePart.id.startsWith('pleura') || activePart.id === 'cavitas-pleuralis') && (objNameNorm.includes('lobus') || objNameNorm.includes('paru'))) matches = true;

            // Fissure zoom target mappings: focus on the adjoining lobes
            if (activePart.id === 'fisura-horizontal-kanan' && (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobusmediuskanan'))) matches = true;
            if (activePart.id === 'fisura-oblique-kanan' && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusmediuskanan') || objNameNorm.includes('lobussuperiorkanan'))) matches = true;
            if (activePart.id === 'fisura-oblique-kiri' && (objNameNorm.includes('lobussuperiorkiri') || objNameNorm.includes('lobusinferiorkiri'))) matches = true;

            // Landmarks zoom targets
            if (activePart.id === 'apex-pulmonis' && (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobussuperiorkiri'))) matches = true;
            if (activePart.id === 'basis-pulmonis' && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusinferiorkiri'))) matches = true;
            if ((activePart.id === 'radix-pulmonis' || activePart.id === 'hilum-pulmonis' || activePart.id === 'ligamentum-pulmonale') && (objNameNorm.includes('lobus') || objNameNorm.includes('bronkus'))) matches = true;
            if (activePart.id === 'margo-anterior' && (objNameNorm.includes('lobussuperiorkanan') || objNameNorm.includes('lobussuperiorkiri') || objNameNorm.includes('lobusmediuskanan'))) matches = true;
            if ((activePart.id === 'margo-inferior' || activePart.id === 'margo-posterior') && (objNameNorm.includes('lobusinferiorkanan') || objNameNorm.includes('lobusinferiorkiri'))) matches = true;
            if ((activePart.id === 'incisura-cardiaca' || activePart.id === 'lingula-pulmonis') && objNameNorm.includes('lobussuperiorkiri')) matches = true;

            if (matches) {
              targetMesh = child;
            }
          }
        });

        if (targetMesh) {
          bounds.refresh(targetMesh).clip().fit();
        } else {
          bounds.refresh(parentGroupRef.current).clip().fit();
        }
      } else {
        bounds.refresh(parentGroupRef.current).clip().fit();
      }
    }
  }, [activePart, bounds, parentGroupRef]);

  return null;
}

export default function LungScene({ parts, activeId, activePart, onSelect, showLabels, setNotice, breathingRate, lang }) {
  const parentGroupRef = React.useRef();

  return (
    <Canvas
      camera={{ position: [0, 0.58, 2.95], fov: 32 }}
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#eaeff5']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2.8, 3.5, 2.4]} intensity={2.2} castShadow />
      <pointLight position={[-2, 1.4, 2.2]} intensity={1.0} color="#cce6ff" />
      <Suspense fallback={<Loader />}>
        <gridHelper args={[6, 30, '#cbd5e1', '#e2e8f0']} position={[0, -1.3, 0]} />
        <Bounds fit clip observe margin={1.28}>
          <BoundsController activePart={activePart} parentGroupRef={parentGroupRef} />
          <group ref={parentGroupRef} scale={7.2} position={[0, -1.03, 0]} rotation={[0.02, 0, 0]}>
            <LungsModel 
              activePart={activePart}
              breathingRate={breathingRate}
              onSurfaceClick={(meshName, worldPoint) => {
                if (parentGroupRef.current && worldPoint) {
                  // Transform world click coordinates to group's local coordinates
                  const localPoint = parentGroupRef.current.worldToLocal(worldPoint.clone());
                  
                  const isAirwayMesh = meshName.toLowerCase().includes('part01') || 
                                       meshName.toLowerCase().includes('trakea') || 
                                       meshName.toLowerCase().includes('bronkus');
                  const isLobeMesh = !isAirwayMesh;
                  
                  // Filter parts by category to prevent cross-matching (e.g. clicking airway but selecting lobe)
                  const candidateParts = parts.filter(part => {
                    const isAirwayPart = part.layer.id === 'Saluran Napas' || part.layer.id === 'Mikro';
                    if (isAirwayMesh) return isAirwayPart;
                    if (isLobeMesh) return !isAirwayPart;
                    return true;
                  });

                  let closestPart = null;
                  let minDistance = Infinity;

                  candidateParts.forEach((part) => {
                    const dx = part.position[0] - localPoint.x;
                    const dy = part.position[1] - localPoint.y;
                    const dz = part.position[2] - localPoint.z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    if (distance < minDistance) {
                      minDistance = distance;
                      closestPart = part;
                    }
                  });

                  // If click is within proximity, select it automatically!
                  if (closestPart && minDistance < 0.18) {
                    onSelect(closestPart.id);
                  } else if (closestPart) {
                    // Fallback to closest candidate regardless of distance
                    onSelect(closestPart.id);
                  } else {
                    setNotice(lang === 'id' 
                      ? `Model ini masih satu object besar: ${meshName}. Silakan ketuk pin '+' untuk memilih organ ini.` 
                      : `This model is a single mesh: ${meshName}. Please tap the '+' pins to select this organ.`
                    );
                  }
                }
              }} 
            />
            <BreathingRings breathingRate={breathingRate} />
            
            {activePart && (
              <PulsingPointLight position={activePart.position} color={activePart.color} />
            )}
            <DiafragmaHighlight active={activePart?.id === 'diafragma'} />

            {parts.map((part) => (
              <Hotspot
                key={part.id}
                part={part}
                active={activeId === part.id}
                showLabels={showLabels}
                onSelect={onSelect}
                lang={lang}
              />
            ))}
          </group>
        </Bounds>
        <Environment preset="city" />
        <ContactShadows position={[0, -1.43, 0]} opacity={0.16} scale={4.2} blur={2.2} far={2} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={5.0}
        target={[0, 0.12, 0]}
      />
    </Canvas>
  );
}
