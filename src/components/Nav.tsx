export function Nav() {
    return (
        <nav className="w-full sm:w-44 min-w-20 bg-gray-900 flex flex-col items-center py-8 border-r border-gray-800 shadow-lg">
            <span className="text-white text-base font-semibold mb-6 tracking-wide">Acessos</span>
            <hr className="w-3/4 border-gray-700 mb-6" />
            <ul className="flex sm:flex-col flex-row gap-2 w-full px-4">
                <li>
                    <a
                        href="/"
                        className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium"
                    >
                        Modelos
                    </a>
                </li>
                <li>
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-gray-400 text-xs self-center uppercase tracking-wider px-3 mt-4 mb-2">Mockup's</span>
                        <a
                            href="/"
                            className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium"
                        >
                            Novo Mockup
                        </a>
                        <a
                            href="/"
                            className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium"
                        >
                            Galeria
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
    )
}