import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { OwareBoard as OwareBoardType } from '@/types/oware';

interface AnimationState {
  isAnimating: boolean;
  currentStones: number;
  currentPit: { side: 1 | 2; index: number } | null;
  sowingSequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean }>;
  sequenceIndex: number;
}

interface OwareBoard3DProps {
  board: OwareBoardType;
  currentPlayer: 1 | 2;
  onPitClick: (pitIndex: number) => void;
  selectedPit: number | null;
  isGameActive: boolean;
  animationState?: AnimationState;
}

// Stone component
const Stone = ({ position, color = '#8B4513' }: { position: [number, number, number]; color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.15]} castShadow receiveShadow>
      <meshPhongMaterial color={color} shininess={30} />
    </Sphere>
  );
};

// Pit component
const Pit = ({ 
  position, 
  stones, 
  isClickable, 
  isSelected, 
  isAnimating, 
  onClick, 
  player 
}: {
  position: [number, number, number];
  stones: number;
  isClickable: boolean;
  isSelected: boolean;
  isAnimating: boolean;
  onClick: () => void;
  player: 1 | 2;
}) => {
  const pitRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Animate selected pit
  useFrame((state) => {
    if (pitRef.current && isSelected) {
      pitRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05 - 0.1;
    }
    if (groupRef.current && isAnimating) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.1);
    }
  });

  // Generate stone positions in a circular pattern
  const stonePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const radius = 0.6;
    const layers = Math.ceil(stones / 8);
    
    for (let i = 0; i < stones; i++) {
      const layer = Math.floor(i / 8);
      const angleStep = (Math.PI * 2) / Math.min(8, stones - layer * 8);
      const angle = (i % 8) * angleStep;
      const layerRadius = radius * (0.3 + (layer * 0.3));
      const x = Math.cos(angle) * layerRadius;
      const z = Math.sin(angle) * layerRadius;
      const y = layer * 0.2 + 0.1;
      positions.push([x, y, z]);
    }
    return positions;
  }, [stones]);

  return (
    <group ref={groupRef} position={position}>
      {/* Pit cavity */}
      <Cylinder
        ref={pitRef}
        args={[0.8, 0.9, 0.3]}
        position={[0, -0.1, 0]}
        onClick={isClickable ? onClick : undefined}
        onPointerOver={(e) => {
          if (isClickable) {
            document.body.style.cursor = 'pointer';
            e.stopPropagation();
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        <meshPhongMaterial 
          color={isSelected ? '#D2691E' : isClickable ? '#CD853F' : '#8B4513'} 
          transparent
          opacity={0.8}
        />
      </Cylinder>
      
      {/* Stones */}
      {stonePositions.map((pos, i) => (
        <Stone 
          key={i} 
          position={pos}
          color={isAnimating ? '#FFD700' : player === 1 ? '#8B4513' : '#654321'}
        />
      ))}
      
      {/* Stone count text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color={player === 1 ? '#4A90E2' : '#E24A4A'}
        anchorX="center"
        anchorY="middle"
      >
        {stones}
      </Text>
    </group>
  );
};

// Animated Hand component
const AnimatedHand = ({ 
  currentPit, 
  isAnimating 
}: { 
  currentPit: { side: 1 | 2; index: number } | null;
  isAnimating: boolean;
}) => {
  const handRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (handRef.current && currentPit && isAnimating) {
      // Calculate hand position based on current pit
      const pitX = (currentPit.index - 2.5) * 2.2;
      const pitZ = currentPit.side === 1 ? 1.5 : -1.5;
      
      // Animate hand movement
      handRef.current.position.x = THREE.MathUtils.lerp(handRef.current.position.x, pitX, 0.1);
      handRef.current.position.z = THREE.MathUtils.lerp(handRef.current.position.z, pitZ, 0.1);
      handRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
      
      // Rotate hand slightly
      handRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  if (!isAnimating || !currentPit) return null;

  return (
    <group ref={handRef} position={[0, 2, 0]}>
      {/* Palm */}
      <Box args={[0.6, 0.1, 0.8]} position={[0, 0, 0]} castShadow>
        <meshPhongMaterial color="#FDBCB4" />
      </Box>
      
      {/* Fingers */}
      {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
        <Box key={i} args={[0.08, 0.1, 0.4]} position={[x, 0, 0.3]} castShadow>
          <meshPhongMaterial color="#FDBCB4" />
        </Box>
      ))}
      
      {/* Thumb */}
      <Box args={[0.08, 0.1, 0.3]} position={[0.3, 0, 0]} rotation={[0, 0, 0.5]} castShadow>
        <meshPhongMaterial color="#FDBCB4" />
      </Box>
    </group>
  );
};

// 3D Board component
const Board3D = ({ 
  board, 
  currentPlayer, 
  onPitClick, 
  selectedPit, 
  isGameActive, 
  animationState 
}: OwareBoard3DProps) => {
  return (
    <>
      {/* Main board surface */}
      <Box args={[12, 0.5, 4]} position={[0, -0.25, 0]} receiveShadow>
        <meshPhongMaterial color="#8B4513" />
      </Box>
      
      {/* Board edges */}
      <Box args={[13, 1, 0.5]} position={[0, 0, 2.25]} castShadow>
        <meshPhongMaterial color="#654321" />
      </Box>
      <Box args={[13, 1, 0.5]} position={[0, 0, -2.25]} castShadow>
        <meshPhongMaterial color="#654321" />
      </Box>
      <Box args={[0.5, 1, 4]} position={[6.25, 0, 0]} castShadow>
        <meshPhongMaterial color="#654321" />
      </Box>
      <Box args={[0.5, 1, 4]} position={[-6.25, 0, 0]} castShadow>
        <meshPhongMaterial color="#654321" />
      </Box>

      {/* Player Two Pits (Top Row) */}
      {board.playerTwoPits.slice().reverse().map((pit, index) => {
        const actualIndex = 5 - index;
        const isAnimating = animationState?.currentPit?.side === 2 && 
                          animationState?.currentPit?.index === actualIndex;
        
        return (
          <Pit
            key={`p2-${actualIndex}`}
            position={[(actualIndex - 2.5) * 2.2, 0, -1.5]}
            stones={pit.stones}
            isClickable={currentPlayer === 2 && isGameActive && pit.stones > 0}
            isSelected={selectedPit === actualIndex && currentPlayer === 2}
            isAnimating={isAnimating}
            onClick={() => currentPlayer === 2 && isGameActive && onPitClick(actualIndex)}
            player={2}
          />
        );
      })}

      {/* Player One Pits (Bottom Row) */}
      {board.playerOnePits.map((pit, index) => {
        const isAnimating = animationState?.currentPit?.side === 1 && 
                          animationState?.currentPit?.index === index;
        
        return (
          <Pit
            key={`p1-${index}`}
            position={[(index - 2.5) * 2.2, 0, 1.5]}
            stones={pit.stones}
            isClickable={currentPlayer === 1 && isGameActive && pit.stones > 0}
            isSelected={selectedPit === index && currentPlayer === 1}
            isAnimating={isAnimating}
            onClick={() => currentPlayer === 1 && isGameActive && onPitClick(index)}
            player={1}
          />
        );
      })}

      {/* Score displays */}
      <Text
        position={[0, 1.5, -2.8]}
        fontSize={0.4}
        color="#E24A4A"
        anchorX="center"
        anchorY="middle"
      >
        Player 2: {board.playerTwoScore} stones
      </Text>
      
      <Text
        position={[0, 1.5, 2.8]}
        fontSize={0.4}
        color="#4A90E2"
        anchorX="center"
        anchorY="middle"
      >
        Player 1: {board.playerOneScore} stones
      </Text>

      {/* Current player indicator */}
      <Text
        position={[7, 1, 0]}
        fontSize={0.3}
        color={currentPlayer === 1 ? "#4A90E2" : "#E24A4A"}
        anchorX="center"
        anchorY="middle"
      >
        {`Player ${currentPlayer}'s Turn`}
      </Text>

      {/* Animated Hand */}
      <AnimatedHand
        currentPit={animationState?.currentPit || null}
        isAnimating={animationState?.isAnimating || false}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 5, 0]} intensity={0.3} />
    </>
  );
};

export const OwareBoard3D = (props: OwareBoard3DProps) => {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-blue-900 via-blue-700 to-green-600 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 8, 8], fov: 60 }}
        shadows
      >
        <Board3D {...props} />
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.45}
          minAzimuthAngle={-Math.PI * 0.3}
          maxAzimuthAngle={Math.PI * 0.3}
          minDistance={6}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
};