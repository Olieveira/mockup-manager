import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { AnimatePresence, motion } from 'framer-motion'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6'
import { useEffect, useState } from 'react';

interface PreferenciasProps {
    handleClose: () => void;
    handleChangeColor: (color: string) => void;
    handleChangePresetMode: (presetMode: boolean) => void;
    handleChangePreset: (preset: PresetsType) => void;
    handleChangeAutoRotate: (rotate: boolean) => void;
    handleChangeRotateSpeed: (rotateSpeed: number) => void;
    currentColor: string | undefined;
    currentBgMode: boolean,
    currentPreset: PresetsType,
    currentRotate: boolean,
    currentSpeed: number
}

export function Preferencias({
    handleClose,
    handleChangeColor,
    handleChangePresetMode,
    handleChangePreset,
    handleChangeAutoRotate,
    handleChangeRotateSpeed,
    currentColor,
    currentBgMode,
    currentPreset,
    currentSpeed,
    currentRotate }: PreferenciasProps) {

    const [presetIndex, setPresetIndex] = useState<number>(0)

    const presets: PresetsType[] = [
        "apartment",
        "city",
        "dawn",
        "forest",
        "lobby",
        "night",
        "park",
        "studio",
        "sunset",
        "warehouse"
    ]
    const presetLabels: Record<PresetsType, string> = {
        apartment: "Apartamento",
        city: "Cidade",
        dawn: "Amanhecer",
        forest: "Floresta",
        lobby: "Lobby",
        night: "Noite",
        park: "Parque",
        studio: "Estúdio",
        sunset: "Pôr do Sol",
        warehouse: "Armazém"
    };

    useEffect(() => {
        setPresetIndex(presets.findIndex(p => p === currentPreset))
    }, [])

    useEffect(() => {
        handleChangePreset(presets[presetIndex])
    }, [presetIndex])

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

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <label className="text-gray-200">Rotação automática</label>
                        <button
                            type="button"
                            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors focus:outline-none ${currentRotate ? 'bg-blue-600' : 'bg-gray-600'}`}
                            onClick={() => handleChangeAutoRotate(!currentRotate)}
                            aria-label="Alternar rotação automática"
                        >
                            <span
                                className={`inline-block w-6 h-6 transform bg-white rounded-full shadow transition-transform ${currentRotate ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                    <label className="flex flex-col gap-1 text-gray-200">
                        Velocidade de rotação
                        <input
                            type="range"
                            min={1}
                            max={15}
                            defaultValue={currentSpeed}
                            step={0.05}
                            className={`w-full accent-blue-600 cursor-pointer ${!currentRotate ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Velocidade da rotação"
                            onChange={(e) => { handleChangeRotateSpeed(parseInt(e.target.value)) }}
                            disabled={!currentRotate}
                        />
                    </label>
                </div>
                <hr className="my-3 border-gray-700" />
                {/* WIP: Intensidade da Luz */}
                {/*
                    <label className="flex flex-col gap-1 text-gray-200">
                        Intensidade da Luz
                        <input
                            type="range"
                            min={0}
                            max={2}
                            step={0.01}
                            defaultValue={1}
                            className="w-full accent-blue-600 cursor-pointer"
                            aria-label="Intensidade da Luz"
                        />
                    </label>

                    <hr className="my-6 border-gray-700" />
                    */}

                <h3 className="text-lg font-semibold text-white mb-3">Cenário</h3>

                <div className='flex flex-row justify-around'>
                    <div className="flex flex-col justify-center gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="flex items-center gap-2 text-gray-200">
                                <input
                                    type="radio"
                                    name="backgroundOption"
                                    value="color"
                                    checked={!currentBgMode}
                                    onChange={() => handleChangePresetMode(!currentBgMode)}
                                />
                                Cor de fundo
                            </label>
                            <label className="flex items-center gap-2 text-gray-200">
                                <input
                                    type="radio"
                                    name="backgroundOption"
                                    value="preset"
                                    checked={currentBgMode}
                                    onChange={() => handleChangePresetMode(!currentBgMode)}
                                />
                                Cenário
                            </label>
                        </div>
                    </div>

                    <AnimatePresence>
                        {!currentBgMode && (
                            <motion.div
                                initial={{ opacity: 0, transition: { delay: 0.5, duration: 0.2, ease: "easeInOut" } }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className='flex justify-center items-center'
                            >
                                <input
                                    onChange={(e) => {
                                        handleChangeColor(e.target.value)
                                    }}
                                    value={currentColor}
                                    type="color"
                                    className="w-10 h-10 rounded-full bg-transparent cursor-pointer" />
                            </motion.div>
                        )}

                        {/* Cenários */}
                        <AnimatePresence mode="wait">
                            {currentBgMode && presets.map((preset, i) =>
                                i === presetIndex ? (
                                    <div
                                        key={preset + '-' + i}
                                        className={`flex flex-col items-center gap-2`}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 30 }}
                                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                                            className="text-white text-lg font-medium text-center min-w-28"
                                        >
                                            {presetLabels[preset]}
                                        </motion.span>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                                                onClick={() => setPresetIndex((prev) => prev > 0 ? prev - 1 : presets.length - 1)}
                                                disabled={presets.length <= 1}
                                                aria-label="Preset anterior"
                                            >
                                                <FaArrowLeft className="w-5 h-5 text-blue-400 transition-colors" />
                                            </button>
                                            <button
                                                className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                                                onClick={() => setPresetIndex((prev) => prev < presets.length - 1 ? prev + 1 : 0)}
                                                disabled={presets.length <= 1}
                                                aria-label="Próximo preset"
                                            >
                                                <FaArrowRight className="w-5 h-5 text-blue-400 transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                ) : null
                            )}
                        </AnimatePresence>
                    </AnimatePresence>
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