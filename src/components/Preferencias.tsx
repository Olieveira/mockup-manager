import { motion } from 'framer-motion'
import { useState } from 'react';

interface PreferenciasProps {
    handleClose: () => void;
    handleChangeColor: (color: string) => void;
    currentColor: string | undefined;
}

export function Preferencias({ handleClose, handleChangeColor, currentColor }: PreferenciasProps) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 relative"
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 40 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                    onClick={handleClose}
                    aria-label="Fechar"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">Preferências do Mockup</h2>
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1 text-gray-200">
                        Cor de fundo
                        <input
                            onChange={(e) => {
                                handleChangeColor(e.target.value)
                            }}
                            value={currentColor}
                            type="color"
                            className="w-12 h-8 rounded border-none bg-transparent" />
                    </label>
                </div>
                <label className="flex flex-col gap-1 text-gray-200">
                    Intensidade da Luz
                    <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.01}
                        defaultValue={1}
                        className="w-full accent-blue-600"
                        aria-label="Intensidade da Luz"
                    />
                </label>

                <hr className="my-6 border-gray-700" />

                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Cenários de Fundo</h3>
                    <div className="grid grid-cols-2 gap-4">

                        <div className="flex flex-col items-center">
                            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-900 border-2 border-blue-500 mb-1 flex items-center justify-center text-xs text-white font-bold">Cidade</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-green-300 to-green-700 border-2 border-green-500 mb-1 flex items-center justify-center text-xs text-white font-bold">Natureza</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-800 border-2 border-gray-500 mb-1 flex items-center justify-center text-xs text-white font-bold">Estúdio</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-600 border-2 border-yellow-400 mb-1 flex items-center justify-center text-xs text-gray-900 font-bold">Minimalista</div>
                        </div>
                    </div>
                </div>
                <button
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    onClick={handleClose}
                >
                    Salvar Preferências
                </button>
            </motion.div>
        </motion.div>
    )
}