import fs from 'fs';

const file = 'public/models/realistic_human_lungs.glb';
const buffer = fs.readFileSync(file);

const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.toString('utf8', 16, 20);

if (chunkType === 'JSON') {
  const jsonContent = buffer.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonContent);
  
  console.log('Node Hierarchy & Transformations:');
  if (gltf.nodes) {
    gltf.nodes.forEach((node, i) => {
      console.log(`\nNode ${i}: ${node.name || 'Unnamed'}`);
      if (node.mesh !== undefined) console.log(`  Mesh: ${node.mesh}`);
      if (node.translation) console.log(`  Translation: [${node.translation.join(', ')}]`);
      if (node.rotation) console.log(`  Rotation: [${node.rotation.join(', ')}]`);
      if (node.scale) console.log(`  Scale: [${node.scale.join(', ')}]`);
      if (node.matrix) console.log(`  Matrix: [${node.matrix.join(', ')}]`);
      if (node.children) console.log(`  Children Nodes: [${node.children.join(', ')}]`);
    });
  }
} else {
  console.log('Not a valid GLB');
}
