import fs from 'fs';

// Since we cannot run three.js directly in node easily without virtual DOM, 
// let's look at the JSON structure of the meshes in the GLB to find the accessor min/max values!
// The accessor min/max values in GLTF represent the exact bounding boxes of the vertex positions!
// This is a standard and extremely precise way to find the bounding box of each mesh!

const file = 'public/models/realistic_human_lungs.glb';
const buffer = fs.readFileSync(file);

const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.toString('utf8', 16, 20);

if (chunkType === 'JSON') {
  const jsonContent = buffer.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonContent);
  
  console.log('Accessing mesh bounding boxes from GLTF accessors:');
  
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, meshIdx) => {
      console.log(`\nMesh ${meshIdx}: ${mesh.name}`);
      if (mesh.primitives) {
        mesh.primitives.forEach((primitive, primIdx) => {
          const positionAccessorIdx = primitive.attributes.POSITION;
          const accessor = gltf.accessors[positionAccessorIdx];
          if (accessor) {
            console.log(`  Primitive ${primIdx} POSITION Accessor:`);
            console.log(`    Min: [${accessor.min ? accessor.min.join(', ') : 'None'}]`);
            console.log(`    Max: [${accessor.max ? accessor.max.join(', ') : 'None'}]`);
            if (accessor.min && accessor.max) {
              const centerX = (accessor.min[0] + accessor.max[0]) / 2;
              const centerY = (accessor.min[1] + accessor.max[1]) / 2;
              const centerZ = (accessor.min[2] + accessor.max[2]) / 2;
              console.log(`    Center: [${centerX.toFixed(4)}, ${centerY.toFixed(4)}, ${centerZ.toFixed(4)}]`);
            }
          }
        });
      }
    });
  }
} else {
  console.log('Not a valid GLB');
}
