import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function BgDinamico({ color }: { color: string }) {
    const { gl } = useThree()

    useEffect(() => {
        gl.setClearColor(color)
    }, [color])

    return null
}