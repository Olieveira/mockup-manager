/**
 * Vistas da câmera que a interface oferece. Ficam aqui, sem three, para o menu
 * e os atalhos não puxarem a cena para o pacote inicial. As posições de cada
 * uma ficam em components/scene/cameraOrbit.ts.
 */
export const CAMERA_VIEWS = [
  { id: 'initial', label: 'Inicial', shortcut: '1' },
  { id: 'front', label: 'Frente', shortcut: '2' },
  { id: 'left', label: 'Esquerda', shortcut: '3' },
  { id: 'right', label: 'Direita', shortcut: '4' },
  { id: 'top', label: 'Cima', shortcut: '5' },
] as const

export type CameraView = (typeof CAMERA_VIEWS)[number]['id']
