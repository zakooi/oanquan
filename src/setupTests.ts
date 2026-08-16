import '@testing-library/jest-dom';

// Mock HTMLCanvasElement.getContext for Three.js WebGL in JSDOM
HTMLCanvasElement.prototype.getContext = function (type: string) {
  if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
    return {
      getExtension: () => null,
      getParameter: () => 0,
      createTexture: () => ({}),
      bindTexture: () => {},
      texParameteri: () => {},
      texImage2D: () => {},
      clearColor: () => {},
      clearDepth: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
      viewport: () => {},
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: () => true,
      useProgram: () => {},
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      getAttribLocation: () => 0,
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      getUniformLocation: () => ({}),
      uniformMatrix4fv: () => {},
      drawArrays: () => {},
      drawElements: () => {}
    } as any;
  }
  return null;
} as any;
