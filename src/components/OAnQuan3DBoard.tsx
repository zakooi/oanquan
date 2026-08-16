import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CellState, PlayerSide, RelativeDirection, FloatingDelta } from '../game-logic/gametypes';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface OAnQuan3DBoardProps {
  board: CellState[];
  currentPlayer: PlayerSide;
  isAnimating: boolean;
  activeCellIndex: number | null;
  animatingHandCount: number | null;
  floatingDeltas?: FloatingDelta[];
  onSelectMove: (cellIndex: number, relativeDir: RelativeDirection) => void;
  disabled?: boolean;
}

export const OAnQuan3DBoard: React.FC<OAnQuan3DBoardProps> = ({
  board,
  currentPlayer,
  isAnimating,
  activeCellIndex,
  animatingHandCount,
  floatingDeltas = [],
  onSelectMove,
  disabled = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [cameraView, setCameraView] = useState<'p1' | 'isometric' | 'top'>('isometric');

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cellMeshesRef = useRef<{ [key: number]: THREE.Group }>({});
  const hoveredCellRef = useRef<number | null>(null);

  // Convert 3D world position to 2D screen coordinates
  const getScreenPositionForCell = useCallback((cellIdx: number, yOffset = 1.8) => {
    if (!cameraRef.current || !rendererRef.current || !cellMeshesRef.current[cellIdx]) return null;
    const mesh = cellMeshesRef.current[cellIdx];
    const vector = new THREE.Vector3();
    mesh.getWorldPosition(vector);
    vector.y += yOffset; // Floating above the cell

    vector.project(cameraRef.current);
    const widthHalf = rendererRef.current.domElement.clientWidth / 2;
    const heightHalf = rendererRef.current.domElement.clientHeight / 2;

    return {
      x: vector.x * widthHalf + widthHalf,
      y: -(vector.y * heightHalf) + heightHalf
    };
  }, []);

  const updatePickerScreenPosition = useCallback((cellIdx: number) => {
    const pos = getScreenPositionForCell(cellIdx, 1.8);
    setPickerPosition(pos);
  }, [getScreenPositionForCell]);

  // Update selected cell screen position on animation frames / camera move
  useEffect(() => {
    if (selectedCell !== null) {
      updatePickerScreenPosition(selectedCell);
    } else {
      setPickerPosition(null);
    }
  }, [selectedCell, cameraView, updatePickerScreenPosition]);

  // Handle cell click from 3D scene
  const handleCellSelected = (index: number) => {
    if (disabled || isAnimating) return;

    // Check if cell is selectable
    const isP1 = currentPlayer === PlayerSide.PLAYER1;
    const playerCells = isP1 ? [7, 8, 9, 10, 11] : [1, 2, 3, 4, 5];
    if (!playerCells.includes(index)) return;

    const cell = board[index];
    if (!cell || (cell.danCount + cell.quanCount) === 0) return;

    if (selectedCell === index) {
      setSelectedCell(null);
    } else {
      setSelectedCell(index);
      updatePickerScreenPosition(index);
    }
  };

  const handleDirection = (relDir: RelativeDirection) => {
    if (selectedCell === null) return;
    const cell = selectedCell;
    setSelectedCell(null);
    onSelectMove(cell, relDir);
  };

  // Helper: Create 3D Quan Lai figure (Mũ cánh chuồn + Thân áo đỏ gấm)
  const createQuanLaiFigure = (): THREE.Group => {
    const group = new THREE.Group();

    // 1. Đài sen gỗ dát vàng
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.25, 16);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.7,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, goldMat);
    baseMesh.position.y = 0.12;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    // 2. Thân áo thụng gấm đỏ hoàng tộc
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.75, 1.2, 16);
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.4
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, robeMat);
    bodyMesh.position.y = 0.8;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 3. Đai ngọc / Ngọc bội xanh ngọc bích
    const beltGeo = new THREE.TorusGeometry(0.66, 0.08, 8, 16);
    const jadeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2
    });
    const beltMesh = new THREE.Mesh(beltGeo, jadeMat);
    beltMesh.rotation.x = Math.PI / 2;
    beltMesh.position.y = 0.75;
    group.add(beltMesh);

    // 4. Khuôn mặt quan triều đình
    const headGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      roughness: 0.6
    });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 1.6;
    headMesh.castShadow = true;
    group.add(headMesh);

    // 5. Mũ Cánh Chuồn (Tròn đen ở đỉnh + 2 cánh chuồn ngang dát vàng)
    const hatGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.5, 16);
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.3
    });
    const hatMesh = new THREE.Mesh(hatGeo, hatMat);
    hatMesh.position.y = 1.95;
    group.add(hatMesh);

    // Cánh chuồn bên trái (Wing Left)
    const wingGeo = new THREE.BoxGeometry(0.9, 0.12, 0.04);
    const wingLeft = new THREE.Mesh(wingGeo, goldMat);
    wingLeft.position.set(-0.75, 1.95, 0);
    wingLeft.rotation.z = -0.15;
    group.add(wingLeft);

    // Cánh chuồn bên phải (Wing Right)
    const wingRight = new THREE.Mesh(wingGeo, goldMat);
    wingRight.position.set(0.75, 1.95, 0);
    wingRight.rotation.z = 0.15;
    group.add(wingRight);

    // Hạt ngọc trên mũ
    const hatGemGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const hatGem = new THREE.Mesh(hatGemGeo, goldMat);
    hatGem.position.set(0, 2.25, 0);
    group.add(hatGem);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  };

  // Helper: Create 3D Nong Dan figure (Nón lá hình nón + Áo bà ba nâu)
  const createNongDanFigure = (): THREE.Group => {
    const group = new THREE.Group();

    // 1. Thân áo nâu sồng
    const bodyGeo = new THREE.CylinderGeometry(0.32, 0.46, 0.75, 12);
    const brownMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.8
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, brownMat);
    bodyMesh.position.y = 0.45;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 2. Đầu & Mặt
    const headGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.6
    });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.95;
    headMesh.castShadow = true;
    group.add(headMesh);

    // 3. NÓN LÁ VIỆT NAM (ConeGeometry)
    const nonLaGeo = new THREE.ConeGeometry(0.72, 0.45, 16, 1, true);
    const nonLaMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.5,
      side: THREE.DoubleSide
    });
    const nonLaMesh = new THREE.Mesh(nonLaGeo, nonLaMat);
    nonLaMesh.position.y = 1.15;
    nonLaMesh.castShadow = true;
    group.add(nonLaMesh);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  };

  // Helper: Create Pebble Stones 3D
  const createPebbleStone = (idx: number): THREE.Mesh => {
    const stoneGeo = new THREE.DodecahedronGeometry(0.16 + (idx % 3) * 0.03, 0);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: idx % 2 === 0 ? 0xf8fafc : 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(stoneGeo, stoneMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a0f0b);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 14, 15);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      console.warn('WebGL not supported in current environment', e);
      return;
    }
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    mainLight.position.set(8, 18, 12);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const warmFillLight = new THREE.PointLight(0xf59e0b, 0.8, 25);
    warmFillLight.position.set(-8, 10, -5);
    scene.add(warmFillLight);

    // 5. Floor
    const floorGeo = new THREE.PlaneGeometry(32, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x271610,
      roughness: 0.9
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Big Wooden Board Table
    const boardGeo = new THREE.BoxGeometry(16, 0.8, 8);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a1b,
      roughness: 0.6,
      metalness: 0.15
    });
    const boardTable = new THREE.Mesh(boardGeo, boardMat);
    boardTable.position.set(0, -0.1, 0);
    boardTable.receiveShadow = true;
    boardTable.castShadow = true;
    scene.add(boardTable);

    // Board Golden Inlaid Border
    const borderGeo = new THREE.BoxGeometry(16.3, 0.85, 8.3);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x6d3d25,
      roughness: 0.5
    });
    const boardBorder = new THREE.Mesh(borderGeo, borderMat);
    boardBorder.position.set(0, -0.15, 0);
    scene.add(boardBorder);

    // 7. Cell Positions in 3D Space
    const cellPositions: { [key: number]: { x: number; z: number; isQuan: boolean } } = {
      0: { x: -6.1, z: 0, isQuan: true },
      1: { x: -4.0, z: -1.8, isQuan: false },
      2: { x: -2.0, z: -1.8, isQuan: false },
      3: { x: 0.0, z: -1.8, isQuan: false },
      4: { x: 2.0, z: -1.8, isQuan: false },
      5: { x: 4.0, z: -1.8, isQuan: false },
      6: { x: 6.1, z: 0, isQuan: true },
      11: { x: -4.0, z: 1.8, isQuan: false },
      10: { x: -2.0, z: 1.8, isQuan: false },
      9: { x: 0.0, z: 1.8, isQuan: false },
      8: { x: 2.0, z: 1.8, isQuan: false },
      7: { x: 4.0, z: 1.8, isQuan: false }
    };

    const cellGroups: { [key: number]: THREE.Group } = {};

    Object.entries(cellPositions).forEach(([idxStr, pos]) => {
      const idx = Number(idxStr);
      const cellGroup = new THREE.Group();
      cellGroup.position.set(pos.x, 0.35, pos.z);

      let pitGeo: THREE.BufferGeometry;
      if (pos.isQuan) {
        pitGeo = new THREE.CylinderGeometry(1.45, 1.35, 0.25, 24);
      } else {
        pitGeo = new THREE.BoxGeometry(1.65, 0.25, 2.8);
      }

      const pitMat = new THREE.MeshStandardMaterial({
        color: 0x9c7a68,
        roughness: 0.7,
        metalness: 0.1
      });
      const pitMesh = new THREE.Mesh(pitGeo, pitMat);
      pitMesh.position.y = -0.05;
      pitMesh.receiveShadow = true;
      cellGroup.add(pitMesh);

      const haloGeo = pos.isQuan
        ? new THREE.TorusGeometry(1.6, 0.08, 8, 32)
        : new THREE.BoxGeometry(1.85, 0.06, 3.0);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      haloMesh.position.y = 0.08;
      haloMesh.name = 'halo';
      cellGroup.add(haloMesh);

      cellGroup.userData = { cellIndex: idx, isQuan: pos.isQuan };

      scene.add(cellGroup);
      cellGroups[idx] = cellGroup;
    });

    cellMeshesRef.current = cellGroups;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundCell: number | null = null;
      for (const hit of intersects) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj && obj !== scene) {
          if (obj.userData && obj.userData.cellIndex !== undefined) {
            foundCell = obj.userData.cellIndex;
            break;
          }
          obj = obj.parent;
        }
        if (foundCell !== null) break;
      }

      hoveredCellRef.current = foundCell;
      renderer.domElement.style.cursor = foundCell !== null ? 'pointer' : 'default';
    };

    const onPointerDown = (e: MouseEvent) => {
      if (hoveredCellRef.current !== null) {
        handleCellSelected(hoveredCellRef.current);
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onPointerDown);

    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      Object.entries(cellMeshesRef.current).forEach(([idxStr, group]) => {
        const idx = Number(idxStr);
        const halo = group.getObjectByName('halo') as THREE.Mesh;
        const isHovered = hoveredCellRef.current === idx;
        const isSelected = selectedCell === idx;
        const isActiveAnim = activeCellIndex === idx;

        if (halo) {
          const mat = halo.material as THREE.MeshBasicMaterial;
          if (isActiveAnim) {
            mat.color.setHex(0x38bdf8);
            mat.opacity = 0.9;
            halo.scale.setScalar(1.08 + Math.sin(elapsedTime * 8) * 0.08);
          } else if (isSelected) {
            mat.color.setHex(0x10b981);
            mat.opacity = 0.85;
            halo.scale.setScalar(1.05);
          } else if (isHovered) {
            mat.color.setHex(0xf59e0b);
            mat.opacity = 0.7;
            halo.scale.setScalar(1.02);
          } else {
            mat.opacity = 0;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onPointerDown);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update 3D pieces inside cell groups when board state changes
  useEffect(() => {
    if (!sceneRef.current) return;

    Object.entries(cellMeshesRef.current).forEach(([idxStr, group]) => {
      const idx = Number(idxStr);
      const cell = board[idx];
      if (!cell) return;

      const toRemove: THREE.Object3D[] = [];
      group.children.forEach(child => {
        if (child.name !== 'halo' && child !== group.children[0]) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(c => group.remove(c));

      if (cell.quanCount > 0) {
        const quanModel = createQuanLaiFigure();
        quanModel.position.set(0, 0.1, 0);
        group.add(quanModel);
      }

      if (cell.danCount > 0) {
        if (!cell.isQuan) {
          const nongDanModel = createNongDanFigure();
          nongDanModel.position.set(0, 0.1, 0);
          group.add(nongDanModel);
        }

        const stoneCount = Math.min(cell.danCount, 8);
        for (let i = 0; i < stoneCount; i++) {
          const stone = createPebbleStone(i);
          const angle = (i / stoneCount) * Math.PI * 2;
          const radius = cell.isQuan ? 0.9 : 0.65;
          stone.position.set(
            Math.cos(angle) * radius,
            0.12,
            Math.sin(angle) * (radius * (cell.isQuan ? 1 : 1.2))
          );
          group.add(stone);
        }
      }
    });
  }, [board]);

  const handleCameraChange = (view: 'p1' | 'isometric' | 'top') => {
    setCameraView(view);
    if (!cameraRef.current) return;
    const cam = cameraRef.current;

    if (view === 'p1') {
      cam.position.set(0, 10, 14);
      cam.lookAt(0, 0, -1);
    } else if (view === 'top') {
      cam.position.set(0, 18, 0.1);
      cam.lookAt(0, 0, 0);
    } else {
      cam.position.set(0, 14, 15);
      cam.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="board-3d-wrapper">
      {/* Camera View Selector Toolbar */}
      <div className="board-3d-toolbar">
        <span className="toolbar-label">Góc nhìn 3D:</span>
        <button
          className={`view-btn ${cameraView === 'isometric' ? 'active' : ''}`}
          onClick={() => handleCameraChange('isometric')}
        >
          Góc Nghiêng 3D
        </button>
        <button
          className={`view-btn ${cameraView === 'p1' ? 'active' : ''}`}
          onClick={() => handleCameraChange('p1')}
        >
          Người Chơi 1
        </button>
        <button
          className={`view-btn ${cameraView === 'top' ? 'active' : ''}`}
          onClick={() => handleCameraChange('top')}
        >
          Toàn Cảnh (Top-Down)
        </button>
      </div>

      {/* WebGL Canvas Container */}
      <div className="board-3d-canvas-container" ref={mountRef} />

      {/* Floating 3D Delta Badges Layer */}
      {floatingDeltas.map(d => {
        const pos = getScreenPositionForCell(d.cellIndex, 2.0);
        if (!pos) return null;
        return (
          <div
            key={d.id}
            className={`floating-delta-badge-3d delta-${d.type}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`
            }}
          >
            {d.deltaText}
          </div>
        );
      })}

      {/* Floating 3D Direction Picker Overlay */}
      {selectedCell !== null && pickerPosition && !isAnimating && (
        <div
          className="direction-picker-3d animate-fade-in"
          style={{
            left: `${pickerPosition.x}px`,
            top: `${pickerPosition.y}px`
          }}
        >
          <div className="picker-3d-title">Ô {selectedCell} - Chọn hướng:</div>
          <div className="picker-3d-buttons">
            <button
              className="dir-btn dir-left"
              onClick={() => handleDirection(RelativeDirection.LEFT)}
            >
              <ArrowLeftIcon size={16} />
              <span>Trái</span>
            </button>
            <button
              className="dir-btn dir-right"
              onClick={() => handleDirection(RelativeDirection.RIGHT)}
            >
              <span>Phải</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
