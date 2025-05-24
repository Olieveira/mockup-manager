export function Nav() {
    return (
        <nav className="flex w-full sm:w-44 min-w-20 bg-gray-900 flex-col items-center py-8 border-r border-gray-800 shadow-lg">
            <span className="text-white text-base font-semibold mb-6 tracking-wide">Acessos</span>
            <hr className="w-3/4 border-gray-700 mb-6" />
            <ul className="flex sm:flex-col flex-row gap-2 w-full px-4">
                <li>
                    <div className="flex sm:flex-col flex-row sm:items-center gap-2 w-full">
                        <a
                            href="/"
                            className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium text-center"
                        >
                            Modelos
                        </a>
                        <a
                            href="/"
                            className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium text-center"
                        >
                            Novo Mockup
                        </a>
                        <a
                            href="/"
                            className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium text-center"
                        >
                            Galeria
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
    )
}