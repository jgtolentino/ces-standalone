export function postProcess(result) {
  // Automatic result formatting
  if (result.type === 'data_analysis') {
    return transformToVisualization(result);
  }
  return result;
} 