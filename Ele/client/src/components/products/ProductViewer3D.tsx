import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, Package } from 'lucide-react';

interface ProductViewer3DProps {
  productId: number;
  productName: string;
}

export default function ProductViewer3D({ productId, productName }: ProductViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boxRef = useRef<THREE.Mesh | null>(null);
  const requestRef = useRef<number | null>(null);
  const [is3DActive, setIs3DActive] = useState(false);

  // Setup the scene, camera, and renderer
  useEffect(() => {
    if (!is3DActive) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current?.clientWidth ? containerRef.current.clientWidth / containerRef.current.clientHeight : 1,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create a simple box geometry as a placeholder
    // In a real app, you'd load a 3D model of the product
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create materials for each side with different colors
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x3182ce }), // right - blue
      new THREE.MeshBasicMaterial({ color: 0xe53e3e }), // left - red
      new THREE.MeshBasicMaterial({ color: 0x38a169 }), // top - green
      new THREE.MeshBasicMaterial({ color: 0xd69e2e }), // bottom - yellow
      new THREE.MeshBasicMaterial({ color: 0x805ad5 }), // front - purple
      new THREE.MeshBasicMaterial({ color: 0xdd6b20 })  // back - orange
    ];
    
    const box = new THREE.Mesh(geometry, materials);
    scene.add(box);
    boxRef.current = box;

    // Add some ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create renderer
    if (containerRef.current) {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      
      // Clear container before appending
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && cameraRef.current && rendererRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          
          rendererRef.current.setSize(width, height);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (requestRef.current !== null) {
          cancelAnimationFrame(requestRef.current);
        }
        
        if (rendererRef.current && rendererRef.current.domElement.parentElement) {
          rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement);
        }
        
        // Dispose of resources
        if (boxRef.current) {
          boxRef.current.geometry.dispose();
          if (Array.isArray(boxRef.current.material)) {
            boxRef.current.material.forEach(material => material.dispose());
          } else {
            boxRef.current.material.dispose();
          }
        }
        
        scene.clear();
      };
    }
  }, [is3DActive, productId]);

  // Animation loop
  useEffect(() => {
    if (!is3DActive) return;
    
    const animate = () => {
      if (boxRef.current) {
        boxRef.current.rotation.x += 0.005;
        boxRef.current.rotation.y += 0.01;
      }
      
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [is3DActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const reset3DView = () => {
    if (boxRef.current) {
      boxRef.current.rotation.x = 0;
      boxRef.current.rotation.y = 0;
    }
  };

  return (
    <div className="mt-6 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Product Viewer</h3>
        <div className="flex gap-2">
          <Button
            variant={is3DActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIs3DActive(true)}
            className={is3DActive ? "bg-primary text-white" : ""}
          >
            <Package className="h-4 w-4 mr-2" /> 3D View
          </Button>
          <Button
            variant={!is3DActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIs3DActive(false)}
            className={!is3DActive ? "bg-primary text-white" : ""}
          >
            <img src="/icons/2d-view.svg" alt="2D" className="h-4 w-4 mr-2" /> 2D View
          </Button>
          {is3DActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset3DView}
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
        {is3DActive ? (
          <div ref={containerRef} className="w-full h-full"></div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <img 
              src={`https://source.unsplash.com/800x600/?electronics,${productName.split(' ')[0]}`} 
              alt={productName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
      
      {is3DActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-600">
          Click and drag to rotate the model
        </div>
      )}
    </div>
  );
}